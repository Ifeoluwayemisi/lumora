import axios from "axios";
import prisma from "../models/prismaClient.js";

const WHOIS_API = process.env.WHOIS_API_KEY
  ? "https://www.whoisjsonapi.com/api/v1/whois"
  : null;
const VIRUSTOTAL_API = process.env.VIRUSTOTAL_API_KEY
  ? "https://www.virustotal.com/api/v3"
  : null;

/**
 * Check if domain is registered and get registration details
 */
async function checkDomainRegistration(domain) {
  try {
    if (!WHOIS_API) {
      return {
        registered: null,
        ageInDays: null,
        registrar: null,
        error: "WHOIS API not configured",
      };
    }

    const response = await axios.get(WHOIS_API, {
      params: {
        domain,
        apiKey: process.env.WHOIS_API_KEY,
      },
      timeout: 5000,
    });

    const data = response.data;
    if (!data.registrar) {
      return {
        registered: false,
        ageInDays: null,
        registrar: null,
      };
    }

    // Calculate domain age
    const createdDate = new Date(data.created_date);
    const ageInDays = Math.floor(
      (Date.now() - createdDate) / (1000 * 60 * 60 * 24),
    );

    return {
      registered: true,
      ageInDays,
      registrar: data.registrar,
      createdDate: data.created_date,
      expiresDate: data.expires_date,
    };
  } catch (err) {
    console.error(
      "[DOMAIN_CHECK] Error checking domain registration:",
      err.message,
    );
    return {
      registered: null,
      ageInDays: null,
      registrar: null,
      error: err.message,
    };
  }
}

/**
 * Check SSL certificate validity
 */
async function checkSSLCertificate(domain) {
  try {
    // Make HTTPS request to check certificate validity
    const response = await axios.get(`https://${domain}`, {
      timeout: 5000,
      validateStatus: () => true, // Accept any status code
    });

    return {
      valid: response.status !== 0,
      protocol: response.request?.protocol || "unknown",
    };
  } catch (err) {
    console.error("[SSL_CHECK] Error checking SSL:", err.message);
    return {
      valid: false,
      protocol: null,
      error: err.message,
    };
  }
}

/**
 * Check domain reputation (blacklists, abuse reports)
 */
async function checkDomainReputation(domain) {
  try {
    let flagged = false;
    let reason = null;

    // Check if domain is in common blocklists
    const blocklists = ["spam-abuse.com", "stopforumspam.com", "abuseipdb.com"];

    for (const blocklist of blocklists) {
      try {
        const response = await axios.get(
          `https://${blocklist}/check?ip=${domain}`,
          { timeout: 3000, validateStatus: () => true },
        );

        if (response.status === 200) {
          flagged = true;
          reason = `Domain found in ${blocklist}`;
          break;
        }
      } catch {
        // Continue to next check
      }
    }

    // VirusTotal check if API available
    if (VIRUSTOTAL_API && process.env.VIRUSTOTAL_API_KEY) {
      try {
        const response = await axios.get(
          `${VIRUSTOTAL_API}/domains/${domain}`,
          {
            headers: {
              "x-apikey": process.env.VIRUSTOTAL_API_KEY,
            },
            timeout: 5000,
          },
        );

        if (response.data?.data?.attributes?.last_analysis_stats) {
          const stats = response.data.data.attributes.last_analysis_stats;
          if (stats.malicious > 0 || stats.suspicious > 0) {
            flagged = true;
            reason = `VirusTotal flagged: ${stats.malicious} malicious, ${stats.suspicious} suspicious`;
          }
        }
      } catch (err) {
        console.warn("[VIRUSTOTAL] Check failed:", err.message);
      }
    }

    return {
      flagged,
      reason,
      reputation: flagged ? "SUSPICIOUS" : "CLEAN",
    };
  } catch (err) {
    console.error("[REPUTATION_CHECK] Error checking reputation:", err.message);
    return {
      flagged: null,
      reason: err.message,
      reputation: "UNKNOWN",
    };
  }
}

/**
 * Check if company name appears on website
 */
async function verifyCompanyNameOnWebsite(domain, companyName) {
  try {
    const response = await axios.get(`https://${domain}`, {
      timeout: 5000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    const pageContent = response.data.toLowerCase();
    const companyNameLower = companyName.toLowerCase();

    // Check if company name appears multiple times on page
    const matches = pageContent.split(companyNameLower).length - 1;

    return {
      found: matches > 0,
      occurrences: matches,
      confidence: matches >= 2 ? "HIGH" : matches === 1 ? "MEDIUM" : "LOW",
    };
  } catch (err) {
    console.error(
      "[COMPANY_VERIFY] Error verifying company name:",
      err.message,
    );
    return {
      found: null,
      occurrences: 0,
      confidence: "UNKNOWN",
      error: err.message,
    };
  }
}

/**
 * Main function: Check website legitimacy for manufacturer
 * Returns risk score (0-100) where higher = more suspicious
 */
export async function checkWebsiteLegitimacy(manufacturerId) {
  try {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
    });

    if (!manufacturer) {
      throw new Error("Manufacturer not found");
    }

    if (!manufacturer.website) {
      return {
        riskScore: 50, // Neutral for no website
        hasWebsite: false,
        checks: {
          registered: null,
          ssl: null,
          reputation: null,
          companyName: null,
        },
        verdict: "INCOMPLETE",
        reason: "No website provided",
      };
    }

    // Extract domain from URL
    const url = new URL(
      manufacturer.website.startsWith("http")
        ? manufacturer.website
        : `https://${manufacturer.website}`,
    );
    const domain = url.hostname;

    console.log(
      `[WEBSITE_CHECK] Checking legitimacy for ${manufacturerId}: ${domain}`,
    );

    // Run all checks in parallel
    const [registrationCheck, sslCheck, reputationCheck, companyNameCheck] =
      await Promise.all([
        checkDomainRegistration(domain),
        checkSSLCertificate(domain),
        checkDomainReputation(domain),
        verifyCompanyNameOnWebsite(domain, manufacturer.companyName),
      ]);

    // Calculate risk score
    let riskScore = 50; // Base neutral score

    // Domain age check
    if (registrationCheck.registered === false) {
      riskScore += 40; // Domain not registered = very suspicious
    } else if (registrationCheck.registered === true) {
      const ageInDays = registrationCheck.ageInDays;
      if (ageInDays < 30) {
        riskScore += 35; // Brand new domain = suspicious
      } else if (ageInDays < 90) {
        riskScore += 20; // < 3 months old = moderately suspicious
      } else if (ageInDays < 365) {
        riskScore += 5; // < 1 year old = slightly suspicious
      }
      // else > 1 year = no penalty
    }

    // SSL certificate check
    if (sslCheck.valid === false) {
      riskScore += 25; // No valid SSL = suspicious
    } else if (sslCheck.valid === true) {
      riskScore -= 10; // Has SSL = slightly safer
    }

    // Reputation check
    if (reputationCheck.flagged === true) {
      riskScore += 40; // Flagged domain = very suspicious
    }

    // Company name verification
    if (companyNameCheck.found === false) {
      riskScore += 15; // Company name not on website = somewhat suspicious
    } else if (companyNameCheck.occurrences >= 2) {
      riskScore -= 5; // Multiple mentions = legitimate
    }

    // Normalize to 0-100
    riskScore = Math.max(0, Math.min(riskScore, 100));

    // Determine verdict
    let verdict = "SUSPICIOUS";
    let recommendation = "Manual review required";

    if (riskScore < 30) {
      verdict = "LEGITIMATE";
      recommendation = "Website appears legitimate";
    } else if (riskScore < 60) {
      verdict = "MODERATE";
      recommendation =
        "Website shows some concerns, recommend further verification";
    } else {
      verdict = "SUSPICIOUS";
      recommendation =
        "Website appears illegitimate, request alternative documentation";
    }

    // Save check result
    const checkResult = await prisma.websiteLegitimacyCheck.create({
      data: {
        manufacturerId,
        domain,
        riskScore,
        verdict,
        registrationAgeInDays: registrationCheck.ageInDays,
        hasSsl: sslCheck.valid,
        isFlagged: reputationCheck.flagged,
        companyNameFound: companyNameCheck.found,
        checkDetails: JSON.stringify({
          registration: registrationCheck,
          ssl: sslCheck,
          reputation: reputationCheck,
          companyName: companyNameCheck,
        }),
        checkedAt: new Date(),
      },
    });

    console.log(
      `[WEBSITE_CHECK] Result for ${domain}: ${verdict} (Risk: ${riskScore})`,
    );

    return {
      riskScore,
      hasWebsite: true,
      checks: {
        registered: registrationCheck.registered,
        registrationAge: registrationCheck.ageInDays,
        ssl: sslCheck.valid,
        reputation: reputationCheck.reputation,
        companyName: companyNameCheck.found,
      },
      verdict,
      recommendation,
      checkId: checkResult.id,
    };
  } catch (err) {
    console.error(
      "[WEBSITE_CHECK] Error checking website legitimacy:",
      err.message,
    );
    throw err;
  }
}

/**
 * Get website check history for manufacturer
 */
export async function getWebsiteCheckHistory(manufacturerId, limit = 10) {
  try {
    const history = await prisma.websiteLegitimacyCheck.findMany({
      where: { manufacturerId },
      orderBy: { checkedAt: "desc" },
      take: limit,
    });

    return history;
  } catch (err) {
    console.error(
      "[WEBSITE_HISTORY] Error getting check history:",
      err.message,
    );
    throw err;
  }
}

/**
 * Re-check all manufacturers' websites (scheduled job)
 */
export async function recheckAllManufacturerWebsites() {
  try {
    const manufacturers = await prisma.manufacturer.findMany({
      where: { website: { not: null } },
    });

    const results = [];
    for (const manufacturer of manufacturers) {
      const result = await checkWebsiteLegitimacy(manufacturer.id);
      results.push({
        manufacturerId: manufacturer.id,
        riskScore: result.riskScore,
        verdict: result.verdict,
      });

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log(
      `[WEBSITE_BATCH] Checked ${results.length} manufacturer websites`,
    );
    return results;
  } catch (err) {
    console.error("[WEBSITE_BATCH] Error in batch recheck:", err.message);
    throw err;
  }
}
