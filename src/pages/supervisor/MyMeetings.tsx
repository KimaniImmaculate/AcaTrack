import { useEffect, useState } from "react";

import {
    collection,
    query,
    where,
    onSnapshot
} from "firebase/firestore";


import { db } from "../../services/firebase";

import { useAuth } from "../../contexts/AuthContext";



export default function MyMeetings() {


    const { user } = useAuth();


    const [meetings, setMeetings] = useState<any[]>([]);



    useEffect(() => {


        if (!user) return;



        const q = query(

            collection(db, "meetings"),

            where(
                "supervisorId",
                "==",
                user.uid
            )

        );



        const unsub = onSnapshot(q, (snapshot) => {


            setMeetings(

                snapshot.docs.map(doc => ({

                    id: doc.id,

                    ...doc.data()

                }))

            );


        });


        return () => unsub();



    }, [user]);





    return (

        <div>


            <h2>
                Scheduled Meetings
            </h2>



            {
                meetings.length === 0 &&

                <p>
                    No scheduled meetings.
                </p>

            }



            {
                meetings.map(meeting => (


                    <div
                        key={meeting.id}
                    >


                        <h3>
                            {meeting.title}
                        </h3>


                        <p>
                            Student:
                            {meeting.studentName || "Student"}
                        </p>


                        <p>
                            Date:
                            {meeting.date}
                        </p>


                        <p>
                            Time:
                            {meeting.time}
                        </p>



                        {
                            meeting.meetingLink &&

                            <a
                                href={meeting.meetingLink}
                                target="_blank"
                            >

                                Join Meeting

                            </a>

                        }



                    </div>


                ))

            }



        </div>

    )

}