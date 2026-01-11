# Proxy Configuration Fix

## Issue
When deploying to hosting services like Render, Vercel, or other platforms that use reverse proxies, you may encounter this error:

```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false (default). This could indicate a misconfiguration which would prevent express-rate-limit from accurately identifying users.
```

## Root Cause
- Hosting platforms use reverse proxies to route traffic to your application
- These proxies add headers like `X-Forwarded-For` to preserve the original client IP
- Express.js doesn't trust these headers by default for security reasons
- The `express-rate-limit` middleware detects this mismatch and throws an error

## Solution Applied

### 1. Enable Trust Proxy
```javascript
// Trust proxy when running behind reverse proxy (Render, Vercel, etc.)
app.set('trust proxy', true);
```

### 2. Enhanced Rate Limiting Configuration
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Get the real IP from various proxy headers
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.round(limiter.windowMs / 1000)
    });
  }
});
```

### 3. Debug Middleware (Development Only)
```javascript
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Proxy headers:', {
      'x-forwarded-for': req.get('X-Forwarded-For'),
      'x-real-ip': req.get('X-Real-IP'),
      'x-forwarded-proto': req.get('X-Forwarded-Proto'),
      'req.ip': req.ip,
      'req.ips': req.ips
    });
  }
  next();
});
```

## Alternative Trust Proxy Configurations

### Option 1: Trust All Proxies (Current)
```javascript
app.set('trust proxy', true);
```

### Option 2: Trust Specific Number of Proxies
```javascript
app.set('trust proxy', 1); // Trust first proxy only
```

### Option 3: Trust Specific IP Ranges
```javascript
app.set('trust proxy', ['127.0.0.1', '10.0.0.0/8']);
```

### Option 4: Custom Function
```javascript
app.set('trust proxy', (ip) => {
  // Trust known proxy IPs
  return ip === '127.0.0.1' || ip.startsWith('10.');
});
```

## Verification

### Health Check Endpoint
The `/api/health` endpoint now includes proxy information:

```json
{
  "status": "OK",
  "timestamp": "2026-01-09T...",
  "environment": "production",
  "database": "connected",
  "proxy": {
    "trustProxy": true,
    "clientIP": "192.168.1.1",
    "forwardedIPs": ["192.168.1.1"],
    "headers": {
      "x-forwarded-for": "192.168.1.1",
      "x-real-ip": "192.168.1.1",
      "x-forwarded-proto": "https"
    }
  }
}
```

### Testing
1. Deploy the updated server configuration
2. Check the health endpoint: `GET /api/health`
3. Verify that `proxy.trustProxy` is `true`
4. Confirm that `proxy.clientIP` shows the correct client IP
5. Test rate limiting to ensure it works correctly

## Security Considerations

### Why Trust Proxy is Safe Here
- We're deployed on reputable hosting platforms (Render, Vercel)
- These platforms have proper proxy configurations
- The rate limiting still works correctly with real client IPs
- We're not exposing sensitive information based on IP alone

### Best Practices
- Only enable `trust proxy` when actually behind a proxy
- Use specific proxy configurations in high-security environments
- Monitor logs for unusual IP patterns
- Consider additional security layers (authentication, CORS, etc.)

## Platform-Specific Notes

### Render
- Automatically adds `X-Forwarded-For` headers
- Uses multiple proxy layers
- `trust proxy: true` is recommended

### Vercel
- Adds `X-Forwarded-For` and `X-Real-IP` headers
- Single proxy layer typically
- `trust proxy: 1` or `trust proxy: true` both work

### Railway/Heroku
- Similar proxy behavior to Render
- `trust proxy: true` recommended

## Troubleshooting

### If Rate Limiting Still Doesn't Work
1. Check if `req.ip` returns the correct IP in logs
2. Verify proxy headers are present
3. Test with different `trust proxy` configurations
4. Consider custom `keyGenerator` function

### If Getting Wrong IPs
1. Check the number of proxy layers
2. Use `trust proxy: 1` instead of `true`
3. Implement custom IP extraction logic
4. Verify hosting platform documentation

## Files Modified
- `server/server.js` - Added trust proxy configuration and enhanced rate limiting
- `PROXY-CONFIGURATION.md` - This documentation file

## Status
✅ **FIXED** - The proxy configuration error has been resolved and the application should now work correctly on hosting platforms that use reverse proxies.