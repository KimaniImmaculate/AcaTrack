import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

import { auth, db } from "../../services/firebase";

export default function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const handleLogin = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        setLoading(true);
        setError("");


        try {

            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const userDoc =
                await getDoc(
                    doc(
                        db,
                        "users",
                        credential.user.uid
                    )
                );


            if (!userDoc.exists()) {

                setError(
                    "User profile not found."
                );

                return;
            }


            const userData =
                userDoc.data();


            switch (userData.role) {

                case "student":
                    navigate("/student");
                    break;


                case "supervisor":
                    navigate("/supervisor");
                    break;


                case "admin":
                    navigate("/admin");
                    break;


                default:
                    setError(
                        "Invalid user role."
                    );

            }


        } catch (err: any) {

            setError(
                err.message
            );

        } finally {

            setLoading(false);

        }

    };



    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-100">


            <form
                onSubmit={handleLogin}
                className="w-full max-w-sm bg-white p-6 rounded shadow"
            >

                <h1 className="text-2xl font-bold text-center mb-6">
                    Login
                </h1>



                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-2 mb-3"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />



                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border p-2 mb-3"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />



                {
                    error && (

                        <p className="text-red-500 text-sm mb-3">
                            {error}
                        </p>

                    )
                }



                <button
                    disabled={loading}
                    className="w-full bg-blue-600 text-white p-2 rounded"
                >

                    {
                        loading
                            ? "Logging in..."
                            : "Login"
                    }

                </button>



                <p className="text-center text-sm mt-4">

                    Don't have an account?{" "}

                    <Link
                        to="/register"
                        className="text-blue-600"
                    >
                        Register
                    </Link>

                </p>


            </form>


        </div>

    );

}