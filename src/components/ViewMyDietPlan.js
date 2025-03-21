import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import { ViewMyDietPlanFoodTable } from './ViewMyDietPlanFoodTable.js';
import { Footer } from './Footer.js';
import { getDatabase, ref, onValue } from 'firebase/database';
import { jsPDF } from "jspdf";

export function ViewMyDietPlan(props) {
    // State variables
    const [date, setDate] = useState(new Date());
    const [foodItemDisplayArray, setFoodItemDisplayArray] = useState([]);
    const [firebaseBMIData, setFirebaseBMIData] = useState(null);

    useEffect(() => {
        // Firebase listener for allAddedFoodData
        const db = getDatabase();
        const AlladdedFoodDataRef = ref(db, "allAddedFoodData");

        const unregisterFunction = onValue(AlladdedFoodDataRef, (snapshot) => {
            const newValObj = snapshot.val();
            setFirebaseBMIData(newValObj);

            // Convert object into an array
            if (newValObj) {
                const keys = Object.keys(newValObj);
                const newObjArray = keys.map((key) => newValObj[key]);
                setFoodItemDisplayArray(newObjArray);
            }
        });

        return () => unregisterFunction(); // Cleanup on unmount
    }, []);

    // Filter the diet plan based on the selected date
    let resultArr = [];
    const viewMyDietPlanDate = date.toString().slice(0, 15);
    for (let i = 0; i < foodItemDisplayArray.length; i++) {
        if (foodItemDisplayArray[i].date === viewMyDietPlanDate) {
            resultArr.push(foodItemDisplayArray[i].addedFoodItem);
        }
    }

    // Share function
    const sharePlan = () => {
        const url = window.location.href;
        const text = "Check out my diet plan on My Diet Diary!";

        if (navigator.share) {
            navigator
                .share({
                    title: "My Diet Plan",
                    text: text,
                    url: url,
                })
                .then(() => console.log("Shared successfully"))
                .catch((error) => console.log("Error sharing:", error));
        } else {
            navigator.clipboard.writeText(url);
            alert("Link copied! Share it manually.");
        }
    };

    // Download as PDF function
    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.text("My Diet Plan", 20, 20);
        doc.setFont("helvetica", "normal");
        doc.text(`Date: ${viewMyDietPlanDate}`, 20, 30);

        let y = 50; // Start position for food items
        resultArr.forEach((food, index) => {
            doc.text(`${index + 1}. ${food}`, 20, y);
            y += 10;
        });

        doc.save("My_Diet_Plan.pdf");
    };

    return (
        <div>
            <section id="view-my-diet-plan" className="subsection-3">
                <h1>View My Diet Plan</h1>
                <div className="center">
                    <div className="flex-container-view">
                        {/* Date Picker */}
                        <div className="flex-item-card-view">
                            <form>
                                <label htmlFor="view-plan-date">Date:</label>
                                <DatePicker selected={date} onChange={(date) => setDate(date)} />
                            </form>
                        </div>

                        {/* Displaying Results */}
                        <div className="flex-item-card-view">
                            <h1>Results</h1>
                            <div className='foodtable'>
                                <ViewMyDietPlanFoodTable 
                                    foodData={props.foodData} 
                                    viewMyDietPlanDateFoodItemsArray={resultArr} 
                                    firebaseBMIData={firebaseBMIData} 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Buttons for Share & Download PDF */}
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <button
                        onClick={sharePlan}
                        style={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            backgroundColor: "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            marginRight: "10px",
                        }}
                    >
                        📤 Share Plan
                    </button>

                    <button
                        onClick={downloadPDF}
                        style={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                    >
                        📥 Download as PDF
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    );
}
