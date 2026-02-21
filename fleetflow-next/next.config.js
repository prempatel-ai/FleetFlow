/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:5000/api/:path*',
            },
        ]
    },
    transpilePackages: ['react-leaflet', 'leaflet', 'react-chartjs-2', 'chart.js', 'lucide-react'],
    experimental: {
        esmExternals: 'loose',
    },
}

module.exports = nextConfig
