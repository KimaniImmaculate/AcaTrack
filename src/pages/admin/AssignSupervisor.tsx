import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    query,
    where,
    updateDoc,
    doc
} from "firebase/firestore";

import DashboardLayout from "../../layouts/DashboardLayout";
import { db } from "../../services/firebase";
import { UserProfile } from "../../types/User";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { assignSupervisor } from "../../services/proposalWorkflow";
import { Proposal } from "../../types/Proposal";


interface StudentAssignment {
    id: string;
    title: string;
    studentId: string;
    supervisorId?: string | null;
    status:
    | "draft"
    | "submitted"
    | "under_review"
    | "revision_requested"
    | "resubmitted"
    | "approved"
    | "rejected";
}



export default function AssignSupervisor() {

    const { user, profile } = useAuth();
    const [students, setStudents] = useState<UserProfile[]>([]);
    const [supervisors, setSupervisors] = useState<UserProfile[]>([]);
    const [proposals, setProposals] = useState<StudentAssignment[]>([]);

    const [loading, setLoading] = useState(true);



    useEffect(() => {


        // FETCH STUDENTS

        const studentQuery = query(
            collection(db, "users"),
            where("role", "==", "student")
        );


        const unsubStudents = onSnapshot(
            studentQuery,
            (snapshot) => {

                const data: UserProfile[] =
                    snapshot.docs.map((item) => {

                        const user = item.data();

                        return {
                            id: item.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            role: user.role,
                            department: user.department,
                            admissionNumber: user.admissionNumber,
                            staffNumber: user.staffNumber,
                            createdAt: user.createdAt
                        } as UserProfile;

                    });


                setStudents(data);

            }
        );




        // FETCH SUPERVISORS

        const supervisorQuery = query(
            collection(db, "users"),
            where("role", "==", "supervisor")
        );


        const unsubSupervisors = onSnapshot(
            supervisorQuery,
            (snapshot) => {

                const data: UserProfile[] =
                    snapshot.docs.map((item) => {

                        const user = item.data();

                        return {
                            id: item.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            role: user.role,
                            department: user.department,
                            admissionNumber: user.admissionNumber,
                            staffNumber: user.staffNumber,
                            createdAt: user.createdAt
                        } as UserProfile;

                    });


                setSupervisors(data);

            }
        );




        // FETCH PROPOSALS

        const unsubProposals = onSnapshot(
            collection(db, "proposals"),
            (snapshot) => {


                const data: StudentAssignment[] =
                    snapshot.docs.map((item) => {

                        const proposal = item.data();


                        return {
                            id: item.id,
                            title: proposal.title,
                            studentId: proposal.studentId,
                            supervisorId: proposal.supervisorId ?? null,
                            status: proposal.status ?? "draft",
                        };


                    });



                setProposals(data);
                setLoading(false);


            }
        );



        return () => {

            unsubStudents();
            unsubSupervisors();
            unsubProposals();

        };


    }, []);






    const changeSupervisor = async (
        proposalId: string,
        supervisorId: string
    ) => {
        if (!user) return;

        const prop = proposals.find((p) => p.id === proposalId);
        if (!prop) return;

        const supervisor = supervisors.find((s) => s.id === supervisorId);
        const supervisorName = supervisor
            ? `${supervisor.firstName} ${supervisor.lastName}`
            : null;

        const targetSupervisorId = supervisorId === "" ? null : supervisorId;

        const actor = {
            uid: user.uid,
            name: profile ? `${profile.firstName} ${profile.lastName}` : "Unknown Admin",
            role: "admin" as const
        };

        const mockProposal = {
            id: prop.id,
            studentId: prop.studentId
        } as Proposal;

        await assignSupervisor(
            mockProposal,
            targetSupervisorId,
            supervisorName,
            actor
        );

    };







    if (loading) {

        return (

            <DashboardLayout>

                <div className="p-6">
                    Loading assignments...
                </div>

            </DashboardLayout>

        );

    }






    return (

        <DashboardLayout>


            <div className="p-6">


                <h1 className="text-2xl font-bold mb-6">
                    Supervisor Assignment
                </h1>




                <div className="space-y-4">


                    {proposals.map((proposal) => {



                        const student =
                            students.find(
                                (student) =>
                                    student.id === proposal.studentId
                            );



                        const supervisor =
                            supervisors.find(
                                (supervisor) =>
                                    supervisor.id === proposal.supervisorId
                            );





                        return (


                            <div
                                key={proposal.id}
                                className="bg-white border rounded-lg p-5"
                            >



                                <h2 className="font-semibold text-lg">
                                    {proposal.title}
                                </h2>




                                <div className="mt-2">

                                    <StatusBadge
                                        status={proposal.status}
                                    />

                                </div>





                                <p className="text-sm text-gray-600 mt-3">

                                    Student:{" "}

                                    {student
                                        ? `${student.firstName} ${student.lastName}`
                                        : "Unknown"}

                                </p>





                                <p className="text-sm text-gray-600">

                                    Department:{" "}

                                    {student?.department || "Not Assigned"}

                                </p>






                                <p className="text-sm text-gray-600">

                                    Current Supervisor:{" "}

                                    {supervisor
                                        ? `${supervisor.firstName} ${supervisor.lastName}`
                                        : "Not Assigned"}

                                </p>







                                <select

                                    className="border rounded p-2 mt-4 w-full"


                                    value={
                                        proposal.supervisorId ?? ""
                                    }


                                    onChange={(e) =>
                                        changeSupervisor(
                                            proposal.id,
                                            e.target.value
                                        )
                                    }

                                >



                                    <option value="">
                                        Assign Later / No Supervisor
                                    </option>





                                    {supervisors.map((supervisor) => (


                                        <option

                                            key={supervisor.id}

                                            value={supervisor.id}

                                        >

                                            {supervisor.firstName}{" "}
                                            {supervisor.lastName}

                                        </option>


                                    ))}



                                </select>




                            </div>


                        );


                    })}



                </div>



            </div>



        </DashboardLayout>


    );

}