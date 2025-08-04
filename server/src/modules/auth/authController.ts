import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import "colors";
import { OrganizationModel } from "../organization/models/organizationModel";
import AppError from "../../utils/appError";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../utils/jwtUtils";
import { Roles } from "../organization/types/organizationEnums";
import { UserModel } from "../user/models/userModel";

export const registerOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password, name, designation, address, organizationType } =
    req.body;
  console.log(`organizationType, ${organizationType}`.cyan);

  try {
    const existingOrganization = await OrganizationModel.findOne({ email });

    if (existingOrganization) {
      return next(
        new AppError("Organizartion already exists", StatusCodes.CONFLICT)
      );
    }

    // const password = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(password, 10);

    const newOrganization = await OrganizationModel.create({
      email,
      password: hashedPassword,
      designation,
      name,
      address,
      organizationType,
    });
    if (!newOrganization)
      throw new AppError("DB Error", StatusCodes.BAD_GATEWAY);

    const accessToken = generateAccessToken({
      id: String(newOrganization._id),
      role: Roles.ORGANIZATION,
    });
    const refreshToken = generateRefreshToken({
      id: String(newOrganization._id),
      role: Roles.ORGANIZATION,
    });

    await OrganizationModel.findByIdAndUpdate(newOrganization.id, {
      refreshToken,
    });

    res
      .status(StatusCodes.CREATED)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({ message: "Registration successful", accessToken });
  } catch (err: any) {
    console.log(err.message);
    next(
      err instanceof Error
        ? err
        : new AppError(
            "Error registering user",
            StatusCodes.INTERNAL_SERVER_ERROR
          )
    );
  }
};

// user/organization
export const loginOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { email, password } = req.body;

  if (!email) throw new AppError("Field not found", 400);
  if (!password) throw new AppError("Password Field is required", 400);

  let accessToken;
  let refreshToken;

  if (!password) throw new AppError("Password Field is required", 400);

  const user = await OrganizationModel.findOne({ email });
  if (!user) throw new AppError("Email is not registerd", 404);

  if (!(await bcrypt.compare(password, user.password)))
    return next(new AppError("Invalid Password", StatusCodes.FORBIDDEN));

  accessToken = generateAccessToken({
    id: String(user._id),
    role: Roles.ORGANIZATION,
  });
  refreshToken = generateRefreshToken({
    id: String(user._id),
    role: Roles.ORGANIZATION,
  });
  await OrganizationModel.findByIdAndUpdate(user._id, { refreshToken });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    success: true,
    message: "Login sucessfully",
  });
};


// user/orgnization
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return next(
      new AppError("Refresh token is required", StatusCodes.BAD_REQUEST)
    );
  }

  try {
    let user;
    user = await OrganizationModel.findOneAndUpdate(
      { refreshToken },
      { $unset: { refreshToken: "" } }
    );
    if (!user) {
      user = await UserModel.findOneAndUpdate(
        { refreshToken },
        { $unset: { refreshToken: "" } }
      );
    }

    if (!user) {
      return next(
        new AppError("Invalid refresh token", StatusCodes.BAD_REQUEST)
      );
    }

    res.status(StatusCodes.OK).clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res
      .status(StatusCodes.OK)
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .json({ message: "Logged out successfully" });
  } catch (err: any) {
    next(new AppError("Error logging out", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

// user/orgnization
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return next(
      new AppError("Refresh token is required", StatusCodes.FORBIDDEN)
    );
  }

  try {
    let user;
    user = await OrganizationModel.findOne({ refreshToken });
    if (!user) {
      user = await UserModel.findOne({ refreshToken });
    }

    if (!user) {
      return next(new AppError("Invalid refresh token", StatusCodes.FORBIDDEN));
    }

    const payload = verifyRefreshToken(refreshToken);
    const newAccessToken = generateAccessToken({
      id: payload.id,
      role: payload.role,
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    res.status(StatusCodes.OK).json({ accessToken: newAccessToken });
  } catch (err: any) {
    next(new AppError("Invalid refresh token", StatusCodes.FORBIDDEN));
  }
};
