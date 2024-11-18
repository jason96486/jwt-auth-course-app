import axios from "axios";
const API_URL = process.env.REACT_APP_BACKEND_URL
  ? process.env.REACT_APP_BACKEND_URL + "/api/courses"
  : "http://localhost:8080/api/courses";

class CourseService {
  //取得token
  getToken() {
    let user = localStorage.getItem("user");
    return user ? JSON.parse(user).token : "";
  }
  //對應到後端新增課程
  post(title, description, price) {
    const token = this.getToken();
    return axios.post(
      API_URL,
      { title, description, price },
      { headers: { Authorization: token } }
    );
  }
  //對應到後端用學生_id找註冊課程
  getEnrolledCourses(_id) {
    const token = this.getToken();
    return axios.get(API_URL + "/student/" + _id, {
      headers: { Authorization: token },
    });
  }

  //對應到後端用講師_id找課程
  getInstructorCourses(_id) {
    const token = this.getToken();
    return axios.get(API_URL + "/instructor/" + _id, {
      headers: { Authorization: token },
    });
  }
  //對應到後端用課程名稱找課程
  getCourseByName(name) {
    const token = this.getToken();
    return axios.get(API_URL + "/findByName/" + name, {
      headers: { Authorization: token },
    });
  }
  //對應到後端登入中的學生用課程id註冊課程
  enroll(_id) {
    const token = this.getToken();
    return axios.post(
      API_URL + "/enroll/" + _id,
      {},
      { headers: { Authorization: token } }
    );
  }
}

const CourseServiceInstance = new CourseService();
export default CourseServiceInstance;
