const userApi = require("../lib/api/user-api");
const api = new userApi();
const { connect, destroy, disconnect } = require("../lib/utils/mongoose-connect");

beforeAll(async function () {
  require("dotenv").config();
  await connect(process.env.MONGO_TEST_APP);
});

afterAll(async function () {
  await destroy();
  await disconnect();
});

test("cooks a hash", async function () {
  expect(await api.makeHash("abcd", "1234")).toBe(
    "be18802f60ee2022dab13d37987babcccb257a2a0bec8284295a7e3ee4e77cbe"
  );
});

test("makes some salt", function () {
  expect(api.makeSalt().length).toBe("0e6244f70d2427898766ab7dafaa9169".length);
});

test("makes random six-digit code", function () {
  expect(api.makeSixDigitCode().length).toBe(6);
});

test("verifies hash", async function () {
  const cookedHash = await api.makeHash("abcd", "1234");
  expect(
    api.verifyHash(cookedHash, "be18802f60ee2022dab13d37987babcccb257a2a0bec8284295a7e3ee4e77cbe")
  ).toBe(true);
});

test("create a new user", async function () {
  expect(process.env.MONGO_TEST_APP).toBe("mongodb://127.0.0.1/aarya-test-app");
  const id = await api.create("sanjeet", "sahay", "abc@xyz.com", "12345abc");
  let user = await api.findByEmail("abc@xyz.com");
  expect(id).toBe(user._id.toString());
  user = await api.findById(id);
  expect("abc@xyz.com").toBe(user.email);
  expect("12345abc").not.toBe(user.passwordHash);
});

test("create a new user with provider", async function () {
  const id = await api.createWith(
    "google",
    "sanjeet",
    "sahay",
    "sanjeet sahay",
    "sss@xyz.com",
    "/photo.jpg"
  );
  let user = await api.findByEmail("sss@xyz.com");
  expect(id).toBe(user._id.toString());
  user = await api.findById(id);
  expect("sss@xyz.com").toBe(user.email);
  expect(user.passwordHash).not.toBe(null);
  expect(user.isVerified).toBe(true);
});
