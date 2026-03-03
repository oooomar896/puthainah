/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        bgSlide: "linear-gradient(135deg, #1967AE 0%, #28415F 100%)",
        bgside: "linear-gradient(180deg, #A399E6, #DF7F6E)",
      },
      boxShadow: {
        custom: "0px 20px 25px 0px rgba(210, 210, 210, 0.16)",
        btn: "0px 15px 12.5px 0px rgba(64, 64, 64, 0.11)",
        btnsb: "15px 15px 25px 0px rgba(112, 66, 220, 0.17)",
        shadowBtn: "-10px 25px 12.5px 0px rgba(64, 64, 64, 0.11)",
        shadowOrder: "0px 15px 12.5px 0px rgba(107, 107, 107, 0.11)",
        shadowBtnTrans: "0px 15px 12.5px 0px rgba(107, 107, 107, 0.11)",
      },
      backdropBlur: {
        custom: "5px",
      },
      colors: {
        mainColor: "#E2B13C",
        text_color: "#1A1A1A",
        primary: "#1A1A1A",
        secondary: "#E2B13C",
        accent: "#B8860B",
        luxuryBlack: "#0D0D0D",
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
        'gold-shimmer': 'shimmer 3s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        sm: "2rem",
        lg: "4rem",
        xl: "6rem",
        "2xl": "8rem",
      },
    },
  },
  plugins: [require("tailwindcss-dir")()],
};
