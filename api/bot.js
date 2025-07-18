// Versi Node.js dari Python bot flashback
// Bisa dideploy di Vercel: taruh di folder `/api/` sebagai `bot.js`

const axios = require('axios');
const fs = require('fs');
const path = require('path');

FIRST_NAMES = [
    "john", "jane", "mike", "sarah", "david", "emma", "alex", "lisa", "chris", "anna",
    "james", "maria", "robert", "sophia", "william", "olivia", "richard", "ava", "thomas", "isabella",
    "daniel", "mia", "matthew", "charlotte", "anthony", "amelia", "mark", "harper", "donald", "evelyn",
    "steven", "abigail", "paul", "emily", "andrew", "elizabeth", "joshua", "sofia", "kenneth", "madison",
    "kevin", "avery", "brian", "ella", "george", "scarlett", "timothy", "grace", "ronald", "chloe",
    "jason", "victoria", "edward", "riley", "jeffrey", "aria", "ryan", "lily", "jacob", "aubrey",
    "gary", "zoey", "nicholas", "penelope", "eric", "layla", "jonathan", "nora", "stephen", "luna",
    "larry", "savannah", "justin", "camila", "scott", "gianna", "brandon", "skylar", "benjamin", "allison",
    "frank", "claire", "gregory", "adeline", "raymond", "eleanor", "samuel", "hazel", "patrick", "aubrey",
    "alexander", "stella", "jack", "natalie", "dennis", "zoe", "jerry", "leah", "tyler", "hannah",
    "aaron", "lillian", "jose", "addison", "adam", "eleanor", "nathan", "brooklyn", "henry", "scarlett",
    "douglas", "aubrey", "zachary", "savannah", "peter", "allison", "kyle", "sarah", "walter", "adriana",
    "noah", "maya", "jeremy", "anna", "harold", "claire", "ronald", "victoria", "michael", "madison"
]

LAST_NAMES = [
    "smith", "johnson", "williams", "brown", "jones", "garcia", "miller", "davis", "rodriguez", "martinez",
    "hernandez", "lopez", "gonzalez", "wilson", "anderson", "thomas", "taylor", "moore", "jackson", "martin",
    "lee", "perez", "thompson", "white", "harris", "sanchez", "clark", "ramirez", "lewis", "robinson",
    "walker", "young", "allen", "king", "wright", "scott", "torres", "nguyen", "hill", "flores",
    "green", "adams", "nelson", "baker", "hall", "rivera", "campbell", "mitchell", "carter", "roberts",
    "gomez", "phillips", "evans", "turner", "diaz", "parker", "cruz", "edwards", "collins", "reyes",
    "stewart", "morris", "morales", "murphy", "cook", "rogers", "gutierrez", "ortiz", "morgan", "cooper",
    "peterson", "bailey", "reed", "kelly", "howard", "ramos", "kim", "cox", "ward", "richardson",
    "watson", "brooks", "chavez", "wood", "james", "bennett", "gray", "mendoza", "ruiz", "hughes",
    "price", "alvarez", "castillo", "sanders", "patel", "myers", "long", "ross", "foster", "jimenez",
    "powell", "jenkins", "perry", "russell", "sullivan", "bell", "coleman", "butler", "henderson", "barnes",
    "gonzales", "fisher", "vasquez", "simmons", "romero", "jordan", "patterson", "alexander", "hamilton", "graham",
    "reynolds", "griffin", "wallace", "moreno", "west", "cole", "hayes", "bryant", "herrera", "gibson",
    "ellis", "tran", "medina", "aguilar", "stevens", "murray", "ford", "castro", "marshall", "owens"
]
const EMAIL_DOMAINS = ["@gmail.com", "@outlook.com", "@yahoo.co.id", "@gmail.co.id"];

function randomEmail() {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const number = Math.floor(Math.random() * 90 + 10);
  const domain = EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];
  return `${first}.${last}${number}${domain}`;
}

function randomPassword() {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const num = Math.floor(Math.random() * 900 + 100);
  const symbols = ['!', '@', '#', '$', '%', '&', '*'];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  return `${first.charAt(0).toUpperCase() + first.slice(1)}${num}${symbol}`;
}

function randomOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function register({ refCode, proxy, userAgent }) {
  const email = randomEmail();
  const password = randomPassword();
  const otp = randomOTP();
  const headers = {
    'User-Agent': userAgent,
    'X-Requested-With': 'XMLHttpRequest'
  };

  try {
    // Visit referral link
    await axios.get(
      `https://distribute.flashbacktochina.com/index.php?s=/wap/track/enter&code=${refCode}`,
      {
        proxy: formatProxy(proxy),
        headers,
        timeout: 10000,
      }
    );

    // Register
    const response = await axios.post(
      'https://distribute.flashbacktochina.com/index.php?s=/wap/login/register',
      {
        email,
        captcha: otp,
        password,
        cfpassword: password
      },
      {
        proxy: formatProxy(proxy),
        headers,
        timeout: 15000,
      }
    );

    if (response.data.includes("成功") || response.data.includes("memuat") || response.data.includes("应用")) {
      const log = `${email}:${password} | ${new Date().toLocaleString()}`;
      fs.appendFileSync("akun.txt", log + "\n");
      return { success: true, log };
    } else {
      return { success: false, log: response.data.substring(0, 100) };
    }
  } catch (err) {
    return { success: false, log: err.message };
  }
}

function formatProxy(proxyString) {
  // proxy: http://user:pass@ip:port or just ip:port
  const url = new URL(proxyString);
  return {
    protocol: url.protocol.replace(':', ''),
    host: url.hostname,
    port: parseInt(url.port),
    auth: url.username ? { username: url.username, password: url.password } : undefined
  };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { refCode, jumlah = 5 } = req.body;
  const ua = "Mozilla/5.0 (Linux; Android 11; Redmi Note 11) AppleWebKit/537.36 Chrome/137.0.0.0 Mobile Safari/537.36";

  let proxyList = fs.readFileSync(path.join(__dirname, 'proxy.txt'), 'utf-8')
    .split("\n")
    .map(p => p.trim())
    .filter(p => p);

  const results = [];

  for (let i = 0; i < Math.min(jumlah, proxyList.length); i++) {
    const proxy = proxyList[i];
    const result = await register({ refCode, proxy, userAgent: ua });
    results.push(result);
  }

  res.json(results);
};
