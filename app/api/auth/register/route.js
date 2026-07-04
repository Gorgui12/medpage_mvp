// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword } from "@/lib/password";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export async function POST(request) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 }
      );
    }

    await dbConnect();

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail }).lean();

    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      fullName: fullName?.trim() || "",
    });

    // On ne renvoie jamais passwordHash, même par erreur : on construit
    // explicitement l'objet de réponse plutôt que de renvoyer `user` tel quel.
    return NextResponse.json(
      {
        message: "Compte créé avec succès.",
        user: { id: user._id.toString(), email: user.email },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 409 }
      );
    }

    console.error("Erreur inscription :", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
