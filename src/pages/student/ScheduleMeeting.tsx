import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { createMeetingRequest } from "../../services/meetingService";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";


export default function ScheduleMeeting() {

    const { proposalId } = useParams();

    const { user, profile } = useAuth();


    const [form, setForm] = useState({

        title: "",
        agenda: "",
        date: "",
        time: "",
        duration: "1 hour",
        mode: "online"

    });


    const submitRequest = async () => {


        if (!user || !profile || !proposalId) return;


        try {

            // Get proposal details
            const proposalSnap = await getDoc(
                doc(db, "proposals", proposalId)
            );


            if (!proposalSnap.exists()) {
                alert("Proposal not found");
                return;
            }


            const proposal = proposalSnap.data();



            await createMeetingRequest(

                {
                    studentId: user.uid,

                    supervisorId: proposal.supervisorId,

                    proposalId,

                    title: form.title,

                    agenda: form.agenda,

                    requestedDate: form.date,

                    requestedTime: form.time,

                    duration: form.duration,

                    mode: form.mode as "online" | "physical",

                    status: "pending"

                },

                `${profile.firstName} ${profile.lastName}`

            );


            alert("Meeting request sent successfully");


        } catch (error) {

            console.error(
                "Meeting request error:",
                error
            );

            alert("Failed to send meeting request");

        }

    };



    return (

        <div>

            <h2>
                Schedule Meeting
            </h2>



            <input
                placeholder="Meeting title"
                value={form.title}
                onChange={(e) => setForm({
                    ...form,
                    title: e.target.value
                })}
            />



            <textarea
                placeholder="Meeting agenda"
                value={form.agenda}
                onChange={(e) => setForm({
                    ...form,
                    agenda: e.target.value
                })}
            />



            <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({
                    ...form,
                    date: e.target.value
                })}
            />



            <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({
                    ...form,
                    time: e.target.value
                })}
            />



            <select
                value={form.mode}
                onChange={(e) => setForm({
                    ...form,
                    mode: e.target.value
                })}
            >

                <option value="online">
                    Online
                </option>


                <option value="physical">
                    Physical
                </option>


            </select>



            <button
                onClick={submitRequest}
            >
                Request Meeting
            </button>



        </div>

    );

}