/** @type {import('tailwindcss').Config} */
export default {
  //配置tailwind的应用范围
  //在这里我们配置了tailwind应用到index.html文件和src目录下所有.vue和.js文件
  content: ["./index.html", "./src/**/*.{vue,js,ts}"],
  theme: {
    extend: {
      animation: {
        'animate-spin': 'spin 10s linear infinite',
      },
      keyframes: {
        wiggle: {
          '0%': {transform: 'rotate(0deg)'},
          '100%': {transform: 'rotate(360deg)'},
        },
        Keyplay: {
          '0%': {opacity: '1', transformOrigin: 'right'},
          '100%': {
            transform: 'rotateX(70deg)',
            opacity: '0',
            transformOrigin: 'right',
            visibility: 'hidden'
          },
        },
        Keyplay2: {
          '0%': {
            right:'-25%', transformOrigin: '100% 100%', opacity: '1',
          },
          '100%': { right:'0', transformOrigin: '100% 100%', opacity: '1',},
        }
      }
    },
  },
  plugins: [],
};
