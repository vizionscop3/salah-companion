# **Contributing to Salah Companion**

Thank you for your interest in contributing to Salah Companion! This document provides guidelines and instructions for contributing to the project.

## **Code of Conduct**

By participating in this project, you agree to maintain a respectful and inclusive environment. We are committed to providing a harassment-free experience for everyone, regardless of background, ability, or identity.

## **Getting Started**

### **Prerequisites**

- Node.js 18+
- React Native CLI
- PostgreSQL 14+
- Redis 6+
- Git

### **Setup**

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/salah-companion.git
   cd salah-companion
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
5. Set up the database:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

## **Development Workflow**

### **Branching Model**

We use GitFlow-enhanced branching:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical production fixes
- `release/*`: Release preparation
- `docs/*`: Documentation updates

### **Creating a Branch**

```bash
# For a new feature
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# For a bug fix
git checkout -b bugfix/your-bug-fix-name
```

### **Commit Standards**

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

**Examples:**
```bash
feat(prayer): add guided salah mode for Fajr
fix(azan): correct notification timing
docs(readme): update installation instructions
test(recitation): add unit tests for feedback system
```

### **Pull Request Process**

1. **Update your branch**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-branch
   git rebase develop
   ```

2. **Run tests and linting**:
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

3. **Create a Pull Request**:
   - Use the PR template
   - Reference related issues
   - Include screenshots for UI changes
   - Ensure all checks pass

4. **Code Review**:
   - Address review comments
   - Keep PRs focused and small
   - Respond to feedback promptly

## **Coding Standards**

### **TypeScript**

- Use TypeScript for all new code
- Enable strict mode
- Define types for all functions and components
- Avoid `any` type

### **React Native**

- Use functional components with hooks
- Follow React Native best practices
- Optimize for performance
- Test on both iOS and Android

### **Code Style**

- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Write self-documenting code
- Add comments for complex logic

### **File Structure**

```
src/
  components/     # Reusable UI components
  screens/        # Screen components
  services/       # API and business logic
  utils/          # Helper functions
  types/          # TypeScript type definitions
  hooks/          # Custom React hooks
  context/        # React context providers
  constants/      # App constants
```

## **Testing**

### **Writing Tests**

- Write tests for all new features
- Aim for 80%+ code coverage
- Use React Testing Library for components
- Test user interactions, not implementation

### **Running Tests**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## **Documentation**

### **Code Documentation**

- Document complex functions and algorithms
- Add JSDoc comments for public APIs
- Update README for significant changes
- Keep documentation in sync with code

### **Islamic Content**

- All Islamic content must be verified
- Cite sources for hadiths and interpretations
- Review by qualified scholars for accuracy
- Respect diverse Muslim perspectives

## **Security**

### **Security Guidelines**

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Follow OWASP Top 10 guidelines
- Report security vulnerabilities privately

### **Reporting Security Issues**

Email security concerns to: security@salahcompanion.app

**Do not** create public GitHub issues for security vulnerabilities.

## **Accessibility**

### **Accessibility Requirements**

- All UI must be accessible
- Test with screen readers
- Ensure keyboard navigation works
- Meet WCAG 2.1 AA standards
- Support users with learning differences

## **Performance**

### **Performance Guidelines**

- Optimize images and assets
- Minimize bundle size
- Use lazy loading where appropriate
- Profile and optimize slow operations
- Test on low-end devices

## **Questions?**

- Open a GitHub issue for questions
- Check existing documentation first
- Be respectful and patient

## **Recognition**

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to Salah Companion! 🙏

---

*This contributing guide is a living document and will be updated as the project evolves.*

