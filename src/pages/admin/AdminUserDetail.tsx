import { useEffect, useState } from "react";
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    onSnapshot,
    updateDoc,
    deleteDoc
} from "firebase/firestore";

import { useParams, useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { db } from "../../services/firebase";
import { UserProfile } from "../../types/User";
import { Proposal } from "../../types/Proposal";
import StatusBadge from "../../components/StatusBadge";


interface ProposalUser {
    [key: string]: UserProfile;
}



export default function AdminUserDetail() {


    const { id } = useParams();
    const navigate = useNavigate();


    const [user, setUser] = useState<UserProfile | null>(null);

    const [proposals, setProposals] = useState<Proposal[]>([]);

    const [relatedUsers, setRelatedUsers] = useState<ProposalUser>({});

    const [loading, setLoading] = useState(true);

    // Edit states
    const [isEditing, setIsEditing] = useState(false);
    const [editFirstName, setEditFirstName] = useState("");
    const [editLastName, setEditLastName] = useState("");
    const [editRole, setEditRole] = useState<"student" | "supervisor" | "admin">("student");
    const [editDepartment, setEditDepartment] = useState("");
    const [editAdmissionNumber, setEditAdmissionNumber] = useState("");
    const [editStaffNumber, setEditStaffNumber] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);




    useEffect(() => {


        if (!id) return;



        const loadUser = async () => {


            const userSnap = await getDoc(
                doc(db, "users", id)
            );


            if (!userSnap.exists()) {

                setLoading(false);
                return;

            }



            const userData = {

                id: userSnap.id,

                ...(userSnap.data() as Omit<UserProfile, "id">)

            };



            setUser(userData);



            const field =
                userData.role === "supervisor"
                    ? "supervisorId"
                    : "studentId";



            const proposalQuery = query(

                collection(db, "proposals"),

                where(field, "==", id)

            );



            const unsubscribe = onSnapshot(

                proposalQuery,

                async (snapshot) => {



                    const proposalData: Proposal[] =
                        snapshot.docs.map((doc) => ({

                            id: doc.id,

                            ...(doc.data() as Omit<Proposal, "id">)

                        }));



                    setProposals(proposalData);



                    const usersMap: ProposalUser = {};



                    for (const proposal of proposalData) {


                        const relatedId =
                            userData.role === "supervisor"
                                ? proposal.studentId
                                : proposal.supervisorId;



                        if (
                            relatedId &&
                            !usersMap[relatedId]
                        ) {


                            const relatedSnap = await getDoc(

                                doc(
                                    db,
                                    "users",
                                    relatedId
                                )

                            );



                            if (relatedSnap.exists()) {


                                usersMap[relatedId] = {

                                    id: relatedSnap.id,

                                    ...(relatedSnap.data() as Omit<UserProfile, "id">)

                                };


                            }


                        }


                    }



                    setRelatedUsers(usersMap);

                    setLoading(false);



                }

            );



            return unsubscribe;


        };



        loadUser();



    }, [id]);


    // Sync edit fields with user data when user changes
    useEffect(() => {
        if (user) {
            setEditFirstName(user.firstName || "");
            setEditLastName(user.lastName || "");
            setEditRole(user.role || "student");
            setEditDepartment(user.department || "");
            setEditAdmissionNumber(user.admissionNumber || "");
            setEditStaffNumber(user.staffNumber || "");
        }
    }, [user]);

    const handleSave = async () => {
        if (!id || !user) return;
        setSaving(true);
        try {
            const userRef = doc(db, "users", id);
            const updatedData: Partial<UserProfile> = {
                firstName: editFirstName,
                lastName: editLastName,
                role: editRole,
                department: editDepartment,
            };
            if (editRole === "student") {
                updatedData.admissionNumber = editAdmissionNumber;
                updatedData.staffNumber = "";
            } else if (editRole === "supervisor") {
                updatedData.staffNumber = editStaffNumber;
                updatedData.admissionNumber = "";
            } else {
                updatedData.admissionNumber = "";
                updatedData.staffNumber = "";
            }

            await updateDoc(userRef, updatedData);

            setUser({
                ...user,
                ...updatedData
            } as UserProfile);
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving user details:", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!id || !user) return;
        const confirmDelete = window.confirm(`Are you sure you want to permanently delete user ${user.firstName} ${user.lastName}? This action cannot be undone.`);
        if (!confirmDelete) return;

        setDeleting(true);
        try {
            await deleteDoc(doc(db, "users", id));
            alert("User account successfully deleted.");
            navigate("/admin/users");
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user account. Please try again.");
        } finally {
            setDeleting(false);
        }
    };





    if (loading) {

        return (

            <DashboardLayout>

                <div className="p-6">
                    Loading user details...
                </div>

            </DashboardLayout>

        );

    }





    if (!user) {


        return (

            <DashboardLayout>

                <div className="p-6">
                    User not found.
                </div>

            </DashboardLayout>

        );

    }





    return (

        <DashboardLayout>


            <div className="p-6 max-w-5xl">


                {/* HEADER / ACTIONS */}
                {!isEditing ? (
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">
                            {user.firstName} {user.lastName}
                        </h1>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                            >
                                Edit Details
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {deleting ? "Deleting..." : "Delete Account"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Editing: {user.firstName} {user.lastName}
                        </h1>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    if (user) {
                                        setEditFirstName(user.firstName || "");
                                        setEditLastName(user.lastName || "");
                                        setEditRole(user.role || "student");
                                        setEditDepartment(user.department || "");
                                        setEditAdmissionNumber(user.admissionNumber || "");
                                        setEditStaffNumber(user.staffNumber || "");
                                    }
                                }}
                                disabled={saving}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}


                {/* DETAILS CARD */}
                {!isEditing ? (
                    <div className="bg-white border rounded-lg p-6 space-y-3">
                        <h2 className="font-semibold text-lg border-b pb-2 mb-3">
                            Personal Information
                        </h2>
                        <p>
                            <span className="font-medium text-gray-600">Email:</span> {user.email}
                        </p>
                        <p className="capitalize">
                            <span className="font-medium text-gray-600">Role:</span> {user.role}
                        </p>
                        <p>
                            <span className="font-medium text-gray-600">Department:</span> {user.department || "Not set"}
                        </p>
                        {user.role === "student" && (
                            <p>
                                <span className="font-medium text-gray-600">Admission Number:</span> {user.admissionNumber || "Not set"}
                            </p>
                        )}
                        {user.role === "supervisor" && (
                            <p>
                                <span className="font-medium text-gray-600">Staff Number:</span> {user.staffNumber || "Not set"}
                            </p>
                        )}
                        <p>
                            <span className="font-medium text-gray-600">Account Created:</span>{" "}
                            {user.createdAt?.toDate
                                ? user.createdAt.toDate().toLocaleString()
                                : "Unknown"}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white border rounded-lg p-6 space-y-4">
                        <h2 className="font-semibold text-lg border-b pb-2 mb-3">
                            Edit Personal Information
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full border rounded p-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={editFirstName}
                                    onChange={(e) => setEditFirstName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full border rounded p-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={editLastName}
                                    onChange={(e) => setEditLastName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">
                                Email (Read-only)
                            </label>
                            <input
                                type="text"
                                disabled
                                className="w-full border rounded p-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                                value={user.email}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                    Role
                                </label>
                                <select
                                    className="w-full border rounded p-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={editRole}
                                    onChange={(e) => setEditRole(e.target.value as "student" | "supervisor" | "admin")}
                                >
                                    <option value="student">Student</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                    Department
                                </label>
                                <input
                                    type="text"
                                    className="w-full border rounded p-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={editDepartment}
                                    onChange={(e) => setEditDepartment(e.target.value)}
                                    placeholder="e.g. Computer Science"
                                />
                            </div>
                        </div>

                        {editRole === "student" && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                    Admission Number
                                </label>
                                <input
                                    type="text"
                                    className="w-full border rounded p-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={editAdmissionNumber}
                                    onChange={(e) => setEditAdmissionNumber(e.target.value)}
                                    placeholder="e.g. S13/12345/18"
                                />
                            </div>
                        )}

                        {editRole === "supervisor" && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                    Staff Number
                                </label>
                                <input
                                    type="text"
                                    className="w-full border rounded p-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={editStaffNumber}
                                    onChange={(e) => setEditStaffNumber(e.target.value)}
                                    placeholder="e.g. EMP4567"
                                />
                            </div>
                        )}
                    </div>
                )}






                <div className="mt-8">


                    <h2 className="text-xl font-semibold mb-4">

                        Proposal Activity

                    </h2>




                    {proposals.length === 0 ? (


                        <p className="text-gray-500">
                            No proposals found.
                        </p>


                    ) : (


                        <div className="space-y-4">



                            {proposals.map((proposal) => {


                                const otherUserId =
                                    user.role === "supervisor"
                                        ? proposal.studentId
                                        : proposal.supervisorId;



                                const otherUser =
                                    otherUserId
                                        ? relatedUsers[otherUserId]
                                        : null;



                                return (

                                    <div

                                        key={proposal.id}

                                        className="border rounded-lg p-5 bg-white"

                                    >


                                        <h3 className="font-semibold text-lg">

                                            {proposal.title}

                                        </h3>




                                        <div className="mt-2">

                                            <StatusBadge
                                                status={proposal.status}
                                            />

                                        </div>





                                        {user.role === "supervisor" && (

                                            <p className="mt-3 text-sm">

                                                Student:
                                                {" "}
                                                {otherUser
                                                    ? `${otherUser.firstName} ${otherUser.lastName}`
                                                    : "Unknown"
                                                }

                                            </p>

                                        )}




                                        {user.role === "student" && (

                                            <p className="mt-3 text-sm">

                                                Supervisor:
                                                {" "}
                                                {otherUser
                                                    ? `${otherUser.firstName} ${otherUser.lastName}`
                                                    : "Not assigned"
                                                }

                                            </p>

                                        )}






                                        <p className="text-sm mt-2">

                                            Version:
                                            {" "}
                                            {proposal.version}

                                        </p>





                                        <p className="text-sm mt-2">

                                            Created:

                                            {" "}

                                            {proposal.createdAt?.toDate
                                                ? proposal.createdAt.toDate().toLocaleString()
                                                : "Unknown"
                                            }

                                        </p>




                                        <p className="text-sm mt-2">

                                            Last Updated:

                                            {" "}

                                            {proposal.updatedAt?.toDate
                                                ? proposal.updatedAt.toDate().toLocaleString()
                                                : "Unknown"
                                            }

                                        </p>



                                    </div>

                                );


                            })}


                        </div>


                    )}


                </div>


            </div>


        </DashboardLayout>

    );

}