import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { db } from "../../services/firebase";
import { UserProfile } from "../../types/User";


export default function Users() {

    const navigate = useNavigate();

    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        const unsubscribe = onSnapshot(
            collection(db, "users"),
            (snapshot) => {

                const data: UserProfile[] =
                    snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...(doc.data() as Omit<UserProfile, "id">),
                    }));

                setUsers(data);
                setLoading(false);

            }
        );


        return () => unsubscribe();

    }, []);



    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    Loading users...
                </div>
            </DashboardLayout>
        );
    }



    return (

        <DashboardLayout>

            <div className="mb-6">

                <h1 className="text-2xl font-bold">
                    User Management
                </h1>

                <p className="text-gray-600">
                    Manage students, supervisors and administrators.
                </p>

            </div>



            <div className="bg-white border rounded-lg overflow-hidden">


                <table className="w-full">


                    <thead className="bg-gray-100">

                        <tr>

                            <th className="text-left p-4">
                                Name
                            </th>

                            <th className="text-left p-4">
                                Email
                            </th>

                            <th className="text-left p-4">
                                Role
                            </th>

                            <th className="text-left p-4">
                                Department
                            </th>

                            <th className="text-left p-4">
                                Admission / Staff No.
                            </th>

                            <th className="text-left p-4">
                                Action
                            </th>

                        </tr>

                    </thead>



                    <tbody>


                        {users.map((user) => (

                            <tr
                                key={user.id}
                                className="border-t"
                            >


                                <td className="p-4">
                                    {user.firstName} {user.lastName}
                                </td>


                                <td className="p-4">
                                    {user.email}
                                </td>


                                <td className="p-4 capitalize">
                                    {user.role}
                                </td>


                                <td className="p-4">
                                    {user.department || "Not set"}
                                </td>



                                <td className="p-4">

                                    {user.role === "student"
                                        ? user.admissionNumber || "Not set"
                                        : user.staffNumber || "Not set"
                                    }

                                </td>



                                <td className="p-4">

                                    <button
                                        onClick={() =>
                                            navigate(`/admin/users/${user.id}`)
                                        }
                                        className="bg-blue-600 text-white px-3 py-1 rounded"
                                    >
                                        View Details
                                    </button>

                                </td>


                            </tr>

                        ))}


                    </tbody>


                </table>


            </div>


        </DashboardLayout>

    );

}