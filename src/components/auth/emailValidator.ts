// List of common trusted email domains + standard extensions
export const TRUSTED_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "yahoo.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "aol.com",
  "mail.com",
  "gmx.com",
];

// Block known disposable / throwaway email domains
export const DISPOSABLE_DOMAINS = [
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "yopmail.com",
  "sharklasers.com",
  "throwawaymail.com",
];

export const validateEmail = (emailStr: string): { isValid: boolean; error?: string } => {
  const trimmed = emailStr.trim().toLowerCase();
  if (!trimmed) {
    return { isValid: false, error: "Please enter your email address." };
  }

  // 1. Basic structural syntax check
  const basicRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!basicRegex.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email format (e.g. name@gmail.com)." };
  }

  const parts = trimmed.split("@");
  if (parts.length !== 2) {
    return { isValid: false, error: "Invalid email address format." };
  }

  const [localPart, domain] = parts;

  // 2. Reject short or weird local parts
  if (localPart.length < 3) {
    return { isValid: false, error: "Email prefix is too short." };
  }

  // 3. Block throwaway / temporary domains
  if (DISPOSABLE_DOMAINS.includes(domain)) {
    return { isValid: false, error: "Disposable or temporary email addresses are not permitted." };
  }

  // 4. Strict Domain Validation:
  // Allow known trusted consumer domains OR legitimate educational/corporate domains (.edu, .edu.ph, .org, .gov)
  const isTrusted = TRUSTED_DOMAINS.includes(domain);
  const isInstitutional =
    domain.endsWith(".edu") ||
    domain.endsWith(".edu.ph") ||
    domain.endsWith(".ac.uk") ||
    domain.endsWith(".gov");

  // If it's not a known webmail or institutional domain, run strict sanity checks:
  if (!isTrusted && !isInstitutional) {
    const domainParts = domain.split(".");
    const domainName = domainParts[0];

    // Valid TLD list check
    const recognizedTlds = ["com", "net", "org", "io", "co", "ph", "tech", "dev", "me", "app"];
    const hasValidTld = recognizedTlds.includes(domainParts[domainParts.length - 1]);

    if (!hasValidTld) {
      return {
        isValid: false,
        error: `".${domainParts[domainParts.length - 1]}" is not a recognized domain extension.`,
      };
    }

    // Flag obvious keyboard mashing (e.g. 5+ consecutive consonants like 'sdad2h')
    const consonantClusterRegex = /[bcdfghjklmnpqrstvwxyz]{5,}/i;
    if (consonantClusterRegex.test(domainName) || domainName.length < 4) {
      return {
        isValid: false,
        error: "Please use an established email provider.",
      };
    }
  }

  return { isValid: true };
};
