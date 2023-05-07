import * as dotenv from "dotenv";

export function initEnv() {
  dotenv.config();
}

export function readEnv(key) {
  return process.env[key];
}

export function assetsRoot() {
  return readEnv("ASSETS_PATH");
}

export function defaultStyles() {
  return `${assetsRoot()}/styles/output.css`;
}

export function scriptsRoot() {
  return `${assetsRoot()}/scripts`;
}

export function stylesRoot() {
  return `${assetsRoot()}/styles`;
}
