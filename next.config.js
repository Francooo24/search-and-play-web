/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["nodemailer"],
  },
  images: {
    remotePatterns: [
      { hostname: "hips.hearstapps.com" },
      { hostname: "content.api.news" },
      { hostname: "storage.architecturecompetitions.com" },
      { hostname: "www.greece-is.com" },
      { hostname: "warwick.ac.uk" },
      { hostname: "theclassicalscroll.wordpress.com" },
      { hostname: "upload.wikimedia.org" },
      { hostname: "centralca.cdn-anvilcms.net" },
      { hostname: "www.elissos.com" },
      { hostname: "las.illinois.edu" },
      { hostname: "substackcdn.com" },
      { hostname: "libraryforkids.com" },
      { hostname: "handluggageonly.co.uk" },
      { hostname: "www.oliveoil.com" },
      { hostname: "wp.en.aleteia.org" },
      { hostname: "encrypted-tbn0.gstatic.com" },
    ],
  },
  // Compress responses
  compress: true,
  // Disable x-powered-by header
  poweredByHeader: false,
  // Production source maps (set to false to reduce bundle size)
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
