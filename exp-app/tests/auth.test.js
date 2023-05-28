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

describe("hash and salt tests", function () {
  test("cooks a hash", async function () {
    expect(await api.makeHashAsync("abcd", "1234")).toBe(
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
    const cookedHash = await api.makeHashAsync("abcd", "1234");
    expect(
      api.verifyHash(cookedHash, "be18802f60ee2022dab13d37987babcccb257a2a0bec8284295a7e3ee4e77cbe")
    ).toBe(true);
  });
});

describe("user creation tests", function () {
  test("create a new user", async function () {
    expect(process.env.MONGO_TEST_APP).toBe("mongodb://127.0.0.1/aarya-test-app");
    const id = await api.create("sanjeet", "sahay", "abc@xyz.com", "12345abc");
    let user = await api.findByEmail("abc@xyz.com");
    expect(id).toBe(user._id.toString());
    user = await api.findById(id);
    expect("abc@xyz.com").toBe(user.email);
    expect("12345abc").not.toBe(user.passwordHash);
  });

  test("can't create a new user with invalid email", async function () {
    let x = () => api.create("sanjeet", "sahay", "abc", "12345abc");
    expect(x).rejects.toThrow(Error);
    x = () => api.create("sanjeet", "sahay", "abc.com", "12345abc");
    expect(x).rejects.toThrow(Error);
    x = () => api.create("sanjeet", "sahay", "abc@gm", "12345abc");
    expect(x).rejects.toThrow(Error);
    x = () => api.create("sanjeet", "sahay", "1@cbd", "12345abc");
    expect(x).rejects.toThrow(Error);
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
  });

  test("can't create a new user with invalid provider", async function () {
    let x = api.createWith("goo", "sanjeet", "sahay", "sanjeet sahay", "sss@xyz.com", "/photo.jpg");
    expect(x).rejects.toThrow(Error);
  });

  test("duplicate email fails to signup", async function () {
    const email = "abc@xyz.com";
    const password = "12345abc";
    const x = () => api.create("x", "y", email, password);
    expect(x).rejects.toThrow(Error);
  });

  test("add a new provider user", async function () {
    const email = "aaa@gmail.com";
    const userId = await api.addOrUpdateUser("google", {
      email: email,
      given_name: "aaa",
      family_name: "bbb",
      name: "aaa bbb",
      picture: "/abc.jpg",
    });
    const user = await api.findById(userId);
    expect(user.email).toBe(email);
  });

  test("update changed provider user", async function () {
    const picture = "/abcd.jpg";
    const userId = await api.addOrUpdateUser("google", {
      email: "aaa@gmail.com",
      given_name: "aaa",
      family_name: "bbb",
      name: "aaa bbb",
      picture: picture,
    });
    const user = await api.findById(userId);
    expect(user.photoUrl).toBe(picture);
  });
});

describe("user login tests", function () {
  test("user logs in", async function () {
    const email = "abc@xyz.com";
    const password = "12345abc";
    let user = await api.findByEmail(email);
    const isLoggedIn = await api.matchPassword(password, user.passwordHash, user.salt);
    expect(isLoggedIn).toBe(true);
  });

  test("user fails to log in", async function () {
    const email = "abc@xyz.com";
    const password = "wrong-password";
    let user = await api.findByEmail(email);
    const isLoggedIn = await api.matchPassword(password, user.passwordHash, user.salt);
    expect(isLoggedIn).toBe(false);
  });

  test("user with provider fails to log in with password", async function () {
    const email = "sss@xyz.com";
    const password = "some-password";
    let user = await api.findByEmail(email);
    expect(user.salt).toBe(undefined);
    expect(user.passwordHash).toBe(undefined);
    const t = () => api.makeHashAsync(password, user.salt);
    expect(t).rejects.toThrow(Error);
    const x = () => api.verifyHash(undefined, user.passwordHash);
    expect(x).toThrow(Error);
  });
});

describe("password reset tests", function () {
  test("user with no password can't reset password (e.g. google user using forgot password)", async function () {
    const email = "sss@xyz.com";
    let user = await api.findByEmail(email);
    let id = user._id.toString();
    await expect(api.resetPassword(id, user.verificationCode, "new-password")).rejects.toThrow(
      Error
    );
  });
});

describe("user verification tests", () => {
  test("can't verify user with invalid code", async function () {
    const email = "abc@xyz.com";
    let user = await api.findByEmail(email);
    let id = user._id.toString();
    const x = () => api.verifyEmail(id, "abc");
    expect(x).rejects.toThrow(Error);
    expect(user.isVerified).toBe(false);
  });

  test("old code doesn't work after generating a new code", async function () {
    const email = "abc@xyz.com";
    let user = await api.findByEmail(email);
    let id = user._id.toString();
    // get the old code
    const oldCode = user.verificationCode;
    // verify with the old code: should work
    await api.verifyEmail(id, oldCode);
    user = await api.findByEmail(email);
    expect(user.isVerified).toBe(true);
    // generate a new code
    const newCode = await api.generateNewCode(id);
    user = await api.findByEmail(email);
    // user should be unverified after code generation
    expect(user.isVerified).toBe(false);
    // verify the old code: should not work
    const x = () => api.verifyEmail(id, oldCode);
    expect(x).rejects.toThrow(Error);
    // verify with the new code: should work
    await api.verifyEmail(id, newCode);
    user = await api.findByEmail(email);
    expect(user.isVerified).toBe(true);
  });

  test("verify user with a valid code", async function () {
    const email = "abc@xyz.com";
    let user = await api.findByEmail(email);
    let id = user._id.toString();
    await api.verifyEmail(id, user.verificationCode);
    user = await api.findByEmail(email);
    expect(user.isVerified).toBe(true);
  });

  test("user with provider is validated", async function () {
    const email = "sss@xyz.com";
    let user = await api.findByEmail(email);
    expect(user.isVerified).toBe(true);
  });
});

describe("change password tests", () => {
  test("email user can change password", async function () {
    const email = "abc@xyz.com";
    let user = await api.findByEmail(email);
    let id = user._id.toString();
    await api.changePassword(id, "12345abc", "12345xyz");
    user = await api.findById(id);
    // test password changed
    const matches = await api.matchPassword("12345xyz", user.passwordHash, user.salt);
    expect(matches).toBe(true);
    // revert
    await api.changePassword(id, "12345xyz", "12345abc");
  });
  test("provider user can't change password", async function () {
    const email = "sss@xyz.com";
    let user = await api.findByEmail(email);
    let id = user._id.toString();
    const x = () => api.changePassword(id, "12345abc", "12345xyz");
    expect(x).rejects.toThrow(Error);
  });
});

describe("manage children accounts", function () {
  test("attach a new account", async function () {
    const childId = await api.create("sonit", "sahay", "son@xyz.com", "12345abc");
    let parent = await api.findByEmail("abc@xyz.com");
    expect(parent.children.length).toBe(0);
    await api.addChild(parent._id, childId);
    parent = await api.findByEmail("abc@xyz.com");
    expect(parent.children.length).toBe(1);
  });
  test("change password", async function () {
    const email = "son@xyz.com";
    let user = await api.findByEmail(email);
    let id = user._id.toString();
    await api.changePassword(id, "12345abc", "12345xyz");
    user = await api.findById(id);
    // test password changed
    const matches = await api.matchPassword("12345xyz", user.passwordHash, user.salt);
    expect(matches).toBe(true);
    // revert
    await api.changePassword(id, "12345xyz", "12345abc");
  });
});

describe("delete user tests", function () {
  test("deletes the email user", async function () {
    const email = "abc@xyz.com";
    let user = await api.findByEmail(email);
    let id = user._id.toString();
    await api.destruct(id);
    const missing = await api.findById(id);
    expect(missing).toBe(null);
  });
  test("deletes the provider user", async function () {
    const email = "sss@xyz.com";
    let user = await api.findByEmail(email);
    let id = user._id.toString();
    await api.destruct(id);
    const missing = await api.findById(id);
    expect(missing).toBe(null);
  });
});
