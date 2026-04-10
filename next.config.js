/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["nodemailer", "pg", "pg-pool"],
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
      { hostname: "flagcdn.com" },
      { hostname: "images.pexels.com" },
    ],
  },
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [{ key: "Cache-Control", value: "public, max-age=0" }],
      },
    ];
  },
};

module.exports = nextConfig;
