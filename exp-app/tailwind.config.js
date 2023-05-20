/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.pug"],
  theme: {
    fontFamily: {
      hubot: "Hubot Sans",
      mona: "Mona Sans",
    },
    extend: {
      colors: {
        "fb-blue": "#445793",
        info: "",
        warning: "",
        success: "",
        danger: "",
      },
    },
  },
  plugins: [],
};
