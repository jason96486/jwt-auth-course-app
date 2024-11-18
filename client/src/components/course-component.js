import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CourseService from "../services/course.service";

const CourseComponent = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();
  const handleLoginRedirect = () => {
    navigate("/login");
  };
  const [courseData, setCourseData] = useState(null);
  useEffect(() => {
    //_id在有currentUser state時被賦值
    const _id = currentUser ? currentUser.user._id : null;
    //若currentUser state為講師，向後端請求講師的課程
    if (currentUser && currentUser.user.role === "instructor") {
      CourseService.getInstructorCourses(_id)
        .then((data) => {
          setCourseData(data.data);
        })
        .catch((e) => {
          console.log(e);
        });
      //若currentUser state為學生，向後端請求學生註冊課程
    } else if (currentUser && currentUser.user.role === "student") {
      CourseService.getEnrolledCourses(_id)
        .then((data) => {
          setCourseData(data.data);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [currentUser]);

  return (
    <div style={{ padding: "3rem" }}>
      {!currentUser && (
        <div>
          <p>必須先登入才能看到課程</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleLoginRedirect}
          >
            回到登入頁面
          </button>
        </div>
      )}
      {currentUser && currentUser.user.role === "instructor" && (
        <div>
          <h1>歡迎來到講師頁面</h1>
        </div>
      )}
      {currentUser && currentUser.user.role === "student" && (
        <div>
          <h1>歡迎來到學生頁面</h1>
        </div>
      )}
      {currentUser && courseData && courseData.length !== 0 && (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {courseData.map((course) => {
            return (
              <div className="card" style={{ width: "18rem", margin: "1rem" }}>
                <div className="card-body">
                  <h5 className="card-title">課程名稱:{course.title}</h5>
                  <p style={{ margin: "0.5rem 0rem" }} className="card-text">
                    {course.description}
                  </p>
                  <p style={{ margin: "0.5rem 0rem" }}>
                    學生人數:{course.students.length}
                  </p>
                  <p style={{ margin: "0.5rem 0rem" }}>{course.price}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseComponent;
