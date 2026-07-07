import { useState } from "react";

import {
    createUserWithEmailAndPassword
} from "firebase/auth";

import {
    doc,
    setDoc
} from "firebase/firestore";

import {
    auth,
    db
} from "../../services/firebase";

import {
    useNavigate
} from "react-router-dom";


export default function Register() {

    const navigate = useNavigate();


    const [
        firstName,
        setFirstName
    ] = useState("");


    const [
        lastName,
        setLastName
    ] = useState("");


    const [
        email,
        setEmail
    ] = useState("");


    const [
        password,
        setPassword
    ] = useState("");



    const [
        role,
        setRole
    ] = useState<
        "student" | "supervisor"
    >("student");



    const [
        department,
        setDepartment
    ] = useState("");



    const [
        admissionNumber,
        setAdmissionNumber
    ] = useState("");



    const [
        staffNumber,
        setStaffNumber
    ] = useState("");



    const [
        loading,
        setLoading
    ] = useState(false);



    const [
        error,
        setError
    ] = useState("");




    const handleRegister = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        setLoading(true);
        setError("");



        try {


            if (role === "student") {

                const admissionRegex =
                    /^[A-Z]{3}\/\d{3}\/\d{2}$/;


                if (
                    !admissionRegex.test(
                        admissionNumber
                    )
                ) {

                    throw new Error(
                        "Admission number must be ABC/123/26"
                    );

                }

            }



            if (role === "supervisor") {

                const staffRegex =
                    /^[A-Z]{3}\d{5}$/;


                if (
                    !staffRegex.test(
                        staffNumber
                    )
                ) {

                    throw new Error(
                        "Staff number must be XYZ09887"
                    );

                }

            }



            const credential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                credential.user;



            await setDoc(
                doc(
                    db,
                    "users",
                    user.uid
                ),
                {


                    id: user.uid,


                    firstName,


                    lastName,


                    email: user.email,


                    role,


                    department,



                    ...(role === "student" && {

                        admissionNumber

                    }),



                    ...(role === "supervisor" && {

                        staffNumber

                    }),



                    createdAt:
                        new Date()

                }

            );



            navigate("/login");



        } catch (err: any) {

            setError(
                err.message
            );


        } finally {

            setLoading(false);

        }

    };




    return (

        <div className="min-h-screen flex items-center justify-center">


            <form
                onSubmit={handleRegister}
                className="w-96 bg-white p-6 rounded shadow"
            >


                <h1 className="text-xl font-bold mb-5">
                    Create Account
                </h1>



                <input
                    className="w-full border p-2 mb-3"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) =>
                        setFirstName(e.target.value)
                    }
                />



                <input
                    className="w-full border p-2 mb-3"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) =>
                        setLastName(e.target.value)
                    }
                />



                <input
                    className="w-full border p-2 mb-3"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />



                <input
                    className="w-full border p-2 mb-3"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />



                <select
                    className="w-full border p-2 mb-3"
                    value={role}
                    onChange={(e) =>
                        setRole(
                            e.target.value as
                            "student" |
                            "supervisor"
                        )
                    }
                >

                    <option value="student">
                        Student
                    </option>


                    <option value="supervisor">
                        Supervisor
                    </option>

                </select>




                <input
                    className="w-full border p-2 mb-3"
                    placeholder="Department"
                    value={department}
                    onChange={(e) =>
                        setDepartment(e.target.value)
                    }
                />



                {
                    role === "student" && (

                        <input
                            className="w-full border p-2 mb-3"
                            placeholder="Admission Number ABC/123/26"
                            value={admissionNumber}
                            onChange={(e) =>
                                setAdmissionNumber(
                                    e.target.value
                                )
                            }
                        />

                    )
                }



                {
                    role === "supervisor" && (

                        <input
                            className="w-full border p-2 mb-3"
                            placeholder="Staff Number XYZ09887"
                            value={staffNumber}
                            onChange={(e) =>
                                setStaffNumber(
                                    e.target.value
                                )
                            }
                        />

                    )
                }




                {
                    error && (

                        <p className="text-red-500 text-sm mb-3">
                            {error}
                        </p>

                    )
                }



                <button
                    disabled={loading}
                    className="w-full bg-green-600 text-white p-2 rounded"
                >

                    {
                        loading
                            ? "Creating..."
                            : "Register"
                    }

                </button>


            </form>


        </div>

    );

}