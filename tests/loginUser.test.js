import { loginUser } from "../controllers/usersControllers.js";
import { findUser, changeUser } from "../services/usersServices.js";

jest.mock("../services/usersServices.js");

describe("loginUser function", () => {
  it("should return a token and user object with correct credentials", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const existUser = {
      _id: "user-id",
      email: "test@example.com",
      password: "hashedPassword",
      subscription: "free",
    };

    findUser.mockResolvedValue(existUser);

    jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

    jwt.sign.mockReturnValue("test-token");

    changeUser.mockResolvedValue({ ...existUser, token: "test-token" });

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      token: "test-token",
      user: { email: "test@example.com", subscription: "free" },
    });
  });
});
