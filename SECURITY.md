# **Security Policy**

## **Supported Versions**

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## **Reporting a Vulnerability**

We take security vulnerabilities seriously. If you discover a security vulnerability, please report it privately.

### **How to Report**

1. **Email**: security@salahcompanion.app
2. **Subject**: "Security Vulnerability: [Brief Description]"
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### **What to Expect**

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Resolution Timeline**: Based on severity
- **Public Disclosure**: After fix is deployed (with your permission)

### **Please Do Not**

- Create public GitHub issues for security vulnerabilities
- Discuss vulnerabilities publicly before resolution
- Attempt to exploit vulnerabilities

## **Security Practices**

### **Data Protection**

- **Encryption**: All sensitive data encrypted at rest and in transit
- **Voice Recordings**: Never stored on servers (local-only)
- **Passwords**: Hashed using bcrypt with 12 rounds
- **API Keys**: Stored securely, never in code

### **Authentication & Authorization**

- **JWT Tokens**: Secure token storage and expiration
- **MFA Support**: Multi-factor authentication for premium accounts
- **Session Management**: Secure session handling
- **Role-Based Access**: Free vs Premium feature access

### **API Security**

- **HTTPS**: All API communications over TLS 1.3
- **Rate Limiting**: Protection against abuse
- **Input Validation**: All inputs validated and sanitized
- **CORS**: Properly configured cross-origin resource sharing

### **Dependency Management**

- **Regular Updates**: Dependencies updated regularly
- **Vulnerability Scanning**: Automated scanning with Snyk
- **Security Advisories**: Monitoring for security advisories
- **Minimal Dependencies**: Only necessary dependencies included

### **Code Security**

- **Static Analysis**: CodeQL and SonarQube scanning
- **Secret Scanning**: Automated credential detection
- **Code Review**: All code reviewed before merge
- **Security Testing**: Regular penetration testing

## **OWASP Top 10 Compliance**

### **1. Injection Prevention**
- Parameterized queries (Prisma ORM)
- Input validation with Zod
- Output encoding

### **2. Broken Authentication**
- Secure password hashing
- MFA support
- Session management
- Secure token storage

### **3. Sensitive Data Exposure**
- Encryption at rest and in transit
- Minimal data collection
- Secure key management
- PII protection

### **4. XML External Entities (XXE)**
- Not applicable (no XML processing)

### **5. Broken Access Control**
- Role-based access control (RBAC)
- Principle of least privilege
- Row-level security

### **6. Security Misconfiguration**
- Secure defaults
- CIS benchmark compliance
- Regular security audits
- Environment variable management

### **7. XSS (Cross-Site Scripting)**
- Content Security Policy (CSP)
- Output encoding
- Input sanitization
- React's built-in XSS protection

### **8. Insecure Deserialization**
- Input validation
- Secure parsing
- Monitoring for anomalies

### **9. Using Components with Known Vulnerabilities**
- Dependency scanning
- Regular updates
- Vulnerability monitoring

### **10. Insufficient Logging & Monitoring**
- Comprehensive logging
- Security event monitoring
- Error tracking (Sentry)
- Performance monitoring (DataDog)

## **Privacy & Compliance**

### **GDPR Compliance**

- **Right to Access**: Users can request their data
- **Right to Erasure**: Users can delete their account and data
- **Data Minimization**: Only collect necessary data
- **Transparency**: Clear privacy policy
- **Consent**: Explicit consent for data processing

### **Data Collection**

We collect minimal data:
- Email address (for account)
- Location (for prayer times, optional)
- Usage analytics (anonymized)
- **We do NOT collect**:
  - Voice recordings (local-only)
  - Personal conversations
  - Payment details (handled by payment providers)

### **Third-Party Services**

- **Payment Processing**: Stripe, Apple Pay, Google Pay (PCI compliant)
- **Analytics**: Anonymized usage data
- **Error Tracking**: Sentry (error logs only)
- **AI Services**: Tarteel.ai (recitation analysis, no storage)

## **Security Updates**

### **Regular Updates**

- **Dependencies**: Weekly security updates
- **Security Patches**: Applied immediately
- **Security Audits**: Quarterly comprehensive audits
- **Penetration Testing**: Annual external testing

### **Security Advisories**

Security advisories will be published for:
- Critical vulnerabilities
- High-severity issues
- Significant security improvements

## **Best Practices for Users**

### **Account Security**

- Use strong, unique passwords
- Enable MFA if available
- Keep the app updated
- Report suspicious activity

### **Privacy**

- Review privacy settings
- Understand data collection
- Use offline features when possible
- Contact us with privacy concerns

## **Security Contact**

**Email**: security@salahcompanion.app

**Response Time**: Within 48 hours

**Public Key**: Available upon request for encrypted communication

---

*This security policy is reviewed and updated regularly.*

