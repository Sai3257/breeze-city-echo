
export const validateEmail = (email: string): string => {
  if (!email) {
    return "Email is required";
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }

  // Check for common typos in domain
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (domain && domain.includes('.')) {
    // Check for double dots or other suspicious patterns
    if (domain.includes('..') || domain.startsWith('.') || domain.endsWith('.')) {
      return "Invalid email domain format";
    }
  }

  // Additional checks for suspicious patterns
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    return "Invalid email format";
  }

  return "";
};
