import { createContext, useContext, useState } from 'react';
import { ROLES, ROLE_COLORS, COURSE_THUMBS } from '../utils/constants';

const AppContext = createContext();

export function AppProvider({ children }) {
  // ── All state starts EMPTY — no pre-seeded data ───────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  // enrollments: { [courseId]: [userId, userId, ...] }
  const [enrollments, setEnrollments] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [contentItems, setContentItems] = useState([]);
  const [platformSettings, setPlatformSettings] = useState({
    contactEmail: 'admin@gmail.com',
    contactPhone: '9100260825',
    aboutText: 'Welcome to Digital Black Board, the premier platform for modern learning management! Here, you can empower yourself with our extensive catalog of courses.',
  });

  const notifyRoles = (targetRoles, message) => {
    // Only send if the current user is NOT the target (e.g. don't notify myself)
    const newNotif = {
      id: Date.now() + Math.random(),
      text: message,
      targetRoles,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const updatePlatformSettings = (newSettings) => {
    setPlatformSettings(prev => ({ ...prev, ...newSettings }));
    if (currentUser) {
      notifyRoles(['Admin'], `⚙️ ${currentUser.name} updated the platform information.`);
    }
  };

  // ── AUTH ──────────────────────────────────────────────────────────────────

  const login = (email, password) => {
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      const emailExists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!emailExists) return { error: 'No account found with that email address.' };
      return { error: 'Incorrect password. Please try again.' };
    }
    if (found.status === 'inactive') return { error: 'Your account is deactivated. Please contact support.' };
    setCurrentUser(found);
    return { user: found };
  };

  const register = (nameOrObj, emailArg, passwordArg, roleArg) => {
    // Accept both object { name, email, password, role } and positional args
    const { name, email, password, role } = (typeof nameOrObj === 'object' && nameOrObj !== null)
      ? nameOrObj
      : { name: nameOrObj, email: emailArg, password: passwordArg, role: roleArg };
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: 'An account with this email already exists. Please sign in.' };
    }
    const initials = name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      initials,
      avatar: null,
      nameChanged: false,
      joined: new Date().toISOString().split('T')[0],
      status: 'active',
      courses: 0,
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return { user: newUser };
  };

  const logout = () => setCurrentUser(null);

  // ── COURSES ───────────────────────────────────────────────────────────────
  // Each course stores `createdBy: adminId` so it is only visible to that admin.

  const addCourse = (courseData) => {
    const newCourse = {
      ...courseData,
      id: Date.now(),
      students: 0,
      rating: 0,
      createdBy: currentUser.id,          // ← owner
      createdByName: currentUser.name,
      thumb: COURSE_THUMBS[courses.length % COURSE_THUMBS.length],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCourses(prev => [newCourse, ...prev]);
    notifyRoles(['Admin'], `📚 ${currentUser.name} created a new course: ${courseData.title} `);
    return newCourse;
  };

  const updateCourse = (id, updates) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    const course = courses.find(c => c.id === id);
    if (course) notifyRoles(['Admin'], `📚 ${currentUser.name} updated the course: ${course.title} `);
  };

  const deleteCourse = (id) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    // cascade: delete all assignments & their submissions for this course
    const affectedAssignmentIds = assignments.filter(a => a.courseId === id).map(a => a.id);
    setAssignments(prev => prev.filter(a => a.courseId !== id));
    setSubmissions(prev => prev.filter(s => !affectedAssignmentIds.includes(s.assignmentId)));
    setEnrollments(prev => { const e = { ...prev }; delete e[id]; return e; });
  };

  // ── SCOPED VIEWS ──────────────────────────────────────────────────────────

  /** Courses this admin created */
  const getAdminCourses = (adminId) => courses.filter(c => c.createdBy === adminId);

  /** Published courses a student can browse (all admins' published courses) */
  const getPublishedCourses = () => courses.filter(c => c.status === 'published');

  /** Courses a student is enrolled in */
  const getEnrolledCourses = (studentId) =>
    courses.filter(c => (enrollments[c.id] || []).includes(studentId));

  /** Assignments visible to an admin: only for their own courses */
  const getAdminAssignments = (adminId) => {
    const myCourseIds = new Set(getAdminCourses(adminId).map(c => c.id));
    return assignments.filter(a => myCourseIds.has(a.courseId));
  };

  /** Assignments visible to a student: only for enrolled courses */
  const getStudentAssignments = (studentId) => {
    const enrolledIds = new Set(getEnrolledCourses(studentId).map(c => c.id));
    return assignments.filter(a => enrolledIds.has(a.courseId));
  };

  /** Submissions visible to an admin: only for their course assignments */
  const getAdminSubmissions = (adminId) => {
    const myAssignmentIds = new Set(getAdminAssignments(adminId).map(a => a.id));
    return submissions.filter(s => myAssignmentIds.has(s.assignmentId));
  };

  // ── ENROLLMENTS ───────────────────────────────────────────────────────────

  const enrollStudent = (userId, courseId) => {
    if ((enrollments[courseId] || []).includes(userId)) return; // already enrolled
    setEnrollments(prev => ({
      ...prev,
      [courseId]: [...(prev[courseId] || []), userId],
    }));
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, students: (c.students || 0) + 1 } : c));
  };

  const isEnrolled = (userId, courseId) =>
    !!(enrollments[courseId] || []).includes(userId);

  // ── ASSIGNMENTS ───────────────────────────────────────────────────────────

  const addAssignment = ({ title, courseId, dueDate, maxScore, description }) => {
    const course = courses.find(c => c.id === Number(courseId));
    const newAssignment = {
      id: Date.now(),
      title,
      courseId: Number(courseId),
      courseName: course?.title || '',
      createdBy: currentUser.id,          // ← owner (same admin as course)
      dueDate,
      maxScore: Number(maxScore) || 100,
      description: description || '',
      submissions: 0,
      graded: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAssignments(prev => [newAssignment, ...prev]);
    return newAssignment;
  };

  const deleteAssignment = (id) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    setSubmissions(prev => prev.filter(s => s.assignmentId !== id));
  };

  // ── SUBMISSIONS ───────────────────────────────────────────────────────────

  const submitAssignment = (assignmentId, studentId, studentName, studentInitials, answer) => {
    if (submissions.find(s => s.assignmentId === assignmentId && s.studentId === studentId)) {
      return { error: 'You have already submitted this assignment.' };
    }
    const assignment = assignments.find(a => a.id === assignmentId);
    const newSub = {
      id: Date.now(),
      assignmentId,
      studentId,
      studentName,
      studentInitials,
      studentAvatar: currentUser?.avatar || null,
      assignmentTitle: assignment?.title || '',
      courseName: assignment?.courseName || '',
      courseId: assignment?.courseId,
      answer: answer || '',
      submittedAt: new Date().toISOString().split('T')[0],
      score: null,
      feedback: '',
      status: 'pending',
    };
    setSubmissions(prev => [newSub, ...prev]);
    setAssignments(prev =>
      prev.map(a => a.id === assignmentId ? { ...a, submissions: a.submissions + 1 } : a)
    );
    // Find the instructor of the course to notify them
    notifyRoles(['Admin', 'Instructor'], `📝 ${studentName} submitted an answer for "${assignment?.title}"`);
    return { submission: newSub };
  };

  const gradeSubmission = (id, score, feedback) => {
    const sub = submissions.find(s => s.id === id);
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, score, feedback, status: 'graded' } : s));
    if (sub && sub.status !== 'graded') {
      setAssignments(prev =>
        prev.map(a => a.id === sub.assignmentId ? { ...a, graded: a.graded + 1 } : a)
      );
    }
  };

  // ── USERS (admin: manage all) ──────────────────────────────────────────────

  const addUser = (user) => setUsers(prev => [{ ...user, id: Date.now(), initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase(), avatar: null, nameChanged: false, status: 'active', courses: 0 }, ...prev]);
  const updateUser = (id, updates) => setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  const deleteUser = (id) => setUsers(prev => prev.filter(u => u.id !== id));

  const updateProfileName = (newName) => {
    if (!currentUser) return;
    const newInitials = newName.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, name: newName, initials: newInitials, nameChanged: true } : u));
    setCurrentUser(prev => ({ ...prev, name: newName, initials: newInitials, nameChanged: true }));
  };

  const updateUserAvatar = (userId, avatarStr) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, avatar: avatarStr } : u));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, avatar: avatarStr }));
    }
    // Also update all their past submissions so the dashboard isn't stale
    setSubmissions(prev => prev.map(s => s.studentId === userId ? { ...s, studentAvatar: avatarStr } : s));
  };

  // ── CONTENT ITEMS ─────────────────────────────────────────────────────────

  const addContent = (item) => {
    setContentItems(prev => [{ ...item, id: Date.now(), createdBy: currentUser.id, createdAt: new Date().toISOString().split('T')[0] }, ...prev]);
  };
  const updateContent = (id, updates) => {
    setContentItems(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };
  const deleteContent = (id) => {
    setContentItems(prev => prev.filter(c => c.id !== id));
  };

  // ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────

  const addAnnouncement = (ann) => setAnnouncements(prev => [{
    ...ann,
    id: Date.now(),
    author: currentUser?.name,
    role: currentUser?.role,
    date: new Date().toISOString().split('T')[0],
  }, ...prev]);

  return (
    <AppContext.Provider value={{
      // auth
      currentUser, login, register, logout,
      // users
      users, addUser, updateUser, deleteUser, updateUserAvatar, updateProfileName,
      // courses
      courses, addCourse, updateCourse, deleteCourse,
      getAdminCourses, getPublishedCourses, getEnrolledCourses,
      // enrollments
      enrollments, enrollStudent, isEnrolled,
      // assignments
      assignments, addAssignment, deleteAssignment,
      getAdminAssignments, getStudentAssignments,
      // submissions
      submissions, submitAssignment, gradeSubmission,
      getAdminSubmissions,
      // announcements
      announcements, addAnnouncement,
      // content items
      contentItems, addContent, updateContent, deleteContent,
      // notifications
      notifications, setNotifications,
      // constants
      ROLE_COLORS, COURSE_THUMBS,
      // platform config
      platformSettings, updatePlatformSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-component
export const useApp = () => useContext(AppContext);
