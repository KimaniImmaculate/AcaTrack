import { useState } from "react";
import { useParams } from "react-router-dom";
import {
    doc,
    updateDoc,
    serverTimestamp,
    getDoc
} from "firebase/firestore";

import { db } from "../../services/firebase";
import { createNotification } from "../../services/notifications";


export default function AddMeetingLink() {

    const { meetingId } = useParams();

    const [link, setLink] = useState("");



    const submitLink = async () => {


        if (!meetingId || !link) return;



        const meetingRef =
            doc(db, "meetings", meetingId);



        const snap =
            await getDoc(meetingRef);



        if (!snap.exists()) return;



        const meeting =
            snap.data();



        await updateDoc(
            meetingRef,
            {

                meetingLink: link,

                status: "scheduled",

                updatedAt: serverTimestamp()

            }
        );



        await createNotification(

            meeting.supervisorId,

            meeting.proposalId,

            "Meeting Link Added",

            "The student has added the meeting link",

            "meeting_link_added"

        );



        alert("Meeting link added");


    };



    return (

        <div>

            <h2>
                Add Meeting Link
            </h2>


            <input

                placeholder="Paste Google Meet link"

                value={link}

                onChange={
                    e => setLink(e.target.value)
                }

            />


            <button onClick={submitLink}>

                Save Meeting Link

            </button>


        </div>

    )

}