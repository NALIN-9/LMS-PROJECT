import { createContext, useContext, useState, useEffect } from 'react';
import { ROLES, ROLE_COLORS, COURSE_THUMBS } from '../utils/constants';

const AppContext = createContext();

// ── Version: bump this to wipe old localStorage and re-seed ──────────────────
const DB_VERSION = 'v4';

// ── Built-in demo accounts ────────────────────────────────────────────────
const DEMO_USERS = [
  { id: 1, name: 'Admin User', email: 'admin@gmail.com', password: 'Admin@123', role: ROLES.ADMIN, initials: 'AU', avatar: null, nameChanged: false, joined: '2025-01-01', status: 'active', courses: 0 },
  { id: 2, name: 'Bhargav', email: 'ins@gmail.com', password: 'ins@123', role: 'Instructor', initials: 'BH', avatar: null, nameChanged: false, joined: '2025-01-01', status: 'active', courses: 0 },
  { id: 3, name: 'Prasanth', email: 'cc@gmail.com', password: 'cc@123', role: 'Content Creator', initials: 'PR', avatar: null, nameChanged: false, joined: '2025-01-01', status: 'active', courses: 0 },
  { id: 4, name: 'Kumar', email: 'st@gmail.com', password: 'st@123', role: ROLES.STUDENT, initials: 'KU', avatar: null, nameChanged: false, joined: '2025-01-01', status: 'active', courses: 0 },
];

// ── Persistent state hook — syncs to localStorage ─────────────────────────────
function usePersist(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem('dbb_' + key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch { return initialValue; }
  });
  useEffect(() => {
    try { localStorage.setItem('dbb_' + key, JSON.stringify(state)); }
    catch { /* quota exceeded — ignore */ }
  }, [key, state]);
  return [state, setState];
}

export function AppProvider({ children }) {
  // Version check is now handled synchronously in main.jsx before React boots.
  // forceReseed is still available for admin use if needed.
  const forceReseed = () => {
    Object.keys(localStorage).filter(k => k.startsWith('dbb_')).forEach(k => localStorage.removeItem(k));
    localStorage.setItem('dbb_users', JSON.stringify(DEMO_USERS));
    localStorage.setItem('dbb_version', DB_VERSION);
    window.location.reload();
  };

  // ── All state persisted to localStorage ───────────────────────────────────

  const [currentUser, setCurrentUser] = usePersist('currentUser', null);
  const [users, setUsers] = usePersist('users', DEMO_USERS);
  const [courses, setCourses] = usePersist('courses', []);
  const [assignments, setAssignments] = usePersist('assignments', []);
  const [submissions, setSubmissions] = usePersist('submissions', []);
  const [announcements, setAnnouncements] = usePersist('announcements', []);
  const [enrollments, setEnrollments] = usePersist('enrollments', {});
  const [notifications, setNotifications] = usePersist('notifications', []);
  const [contentItems, setContentItems] = usePersist('contentItems', []);
  const [ratings, setRatings] = usePersist('ratings', []);          // [{id, courseId, userId, stars, review, date}]
  const [courseProgress, setCourseProgress] = usePersist('courseProgress', {}); // {userId_courseId: {done: Set-as-array, total}}
  const [quizzes, setQuizzes] = usePersist('quizzes', []);           // [{id, title, courseId, questions:[{q,options,answer}], createdBy}]
  const [quizAttempts, setQuizAttempts] = usePersist('quizAttempts', []); // [{id, quizId, userId, score, total, date}]\r
  const [certificates, setCertificates] = usePersist('certificates', []); // [{id, userId, courseId, date}]\r
  const [messages, setMessages] = usePersist('messages', []);             // [{id, fromId, toId, subject, body, sentAt, readByTo}]\r
  const [platformSettings, setPlatformSettings] = usePersist('platformSettings', {

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
    notifyRoles(['Admin'], `New ${role} account created: ${name.trim()}`);
    return { user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dbb_currentUser');
  };

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
    const course = courses.find(c => c.id === courseId);
    notifyRoles(['Admin', 'Instructor'], `${currentUser?.name ?? 'A student'} enrolled in "${course?.title ?? 'a course'}"`);
    notifyRoles([currentUser?.role ?? 'Student'], `You successfully enrolled in "${course?.title ?? 'the course'}". Start learning now!`);
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
    notifyRoles(['Admin', 'Instructor', 'Student'], `New assignment posted: "${title}" — due ${dueDate || 'TBD'}`);
    return newAssignment;
  };

  const deleteAssignment = (id) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    setSubmissions(prev => prev.filter(s => s.assignmentId !== id));
  };

  const updateAssignment = (id, updates) =>
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));

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
    notifyRoles(['Admin', 'Instructor'], `${studentName} submitted "${assignment?.title}"`);
    notifyRoles([currentUser?.role ?? 'Student'], `Assignment "${assignment?.title}" submitted successfully!`);
    return { submission: newSub };
  };

  const gradeSubmission = (id, score, feedback) => {
    const sub = submissions.find(s => s.id === id);
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, score, feedback, status: 'graded' } : s));
    if (sub && sub.status !== 'graded') {
      setAssignments(prev =>
        prev.map(a => a.id === sub.assignmentId ? { ...a, graded: a.graded + 1 } : a)
      );
      // Notify the student who submitted
      const student = users.find(u => u.id === sub.studentId);
      if (student) {
        notifyRoles([student.role], `Your assignment "${sub.assignmentTitle}" was graded — Score: ${score}/${assignments.find(a => a.id === sub.assignmentId)?.maxScore ?? score}`);
      }
      notifyRoles(['Admin', 'Instructor'], `Graded "${sub.assignmentTitle}" for ${sub.studentName} — ${score} pts`);
    }
  };

  // ── USERS (admin: manage all) ──────────────────────────────────────────────

  const addUser = (user) => {
    const newU = { ...user, id: Date.now(), initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase(), avatar: null, nameChanged: false, status: 'active', courses: 0 };
    setUsers(prev => [newU, ...prev]);
    notifyRoles(['Admin'], `New user added: ${user.name} (${user.role})`);
  };
  const updateUser = (id, updates) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (updates.status === 'inactive') {
      const u = users.find(x => x.id === id);
      if (u) notifyRoles(['Admin'], `Account deactivated: ${u.name}`);
    }
  };
  const deleteUser = (id) => {
    const u = users.find(x => x.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    if (u) notifyRoles(['Admin'], `User account removed: ${u.name} (${u.role})`);
  };

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

  const addAnnouncement = (ann) => {
    const newAnn = {
      ...ann,
      id: Date.now(),
      author: currentUser?.name,
      role: currentUser?.role,
      date: new Date().toISOString().split('T')[0],
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    notifyRoles(['Admin', 'Instructor', 'Student', 'Content Creator'], `${currentUser?.name} posted: "${ann.title}"`);
  };

  // ── RATINGS ───────────────────────────────────────────────────────────────
  const addRating = (courseId, stars, review = '') => {
    setRatings(prev => {
      const filtered = prev.filter(r => !(r.courseId === courseId && r.userId === currentUser.id));
      return [...filtered, { id: Date.now(), courseId, userId: currentUser.id, stars, review, date: new Date().toISOString().split('T')[0] }];
    });
  };
  const getCourseRating = (courseId) => {
    const rs = ratings.filter(r => r.courseId === courseId);
    if (!rs.length) return { avg: 0, count: 0 };
    const avg = rs.reduce((s, r) => s + r.stars, 0) / rs.length;
    return { avg: Math.round(avg * 10) / 10, count: rs.length };
  };
  const getUserRating = (courseId, userId) => ratings.find(r => r.courseId === courseId && r.userId === (userId ?? currentUser?.id));

  // ── PROGRESS ──────────────────────────────────────────────────────────────
  const markLessonDone = (courseId, lessonIndex) => {
    const key = `${currentUser.id}_${courseId}`;
    setCourseProgress(prev => {
      const existing = prev[key]?.done ?? [];
      const done = existing.includes(lessonIndex) ? existing : [...existing, lessonIndex];
      return { ...prev, [key]: { done } };
    });
  };
  const getCourseProgress = (userId, courseId) => {
    const key = `${userId}_${courseId}`;
    return courseProgress[key] ?? { done: [] };
  };

  // ── QUIZZES ───────────────────────────────────────────────────────────────
  const addQuiz = (quiz) => {
    const newQ = { ...quiz, id: Date.now(), createdBy: currentUser.id, createdAt: new Date().toISOString().split('T')[0] };
    setQuizzes(prev => [newQ, ...prev]);
    notifyRoles(['Admin', 'Instructor', 'Student', 'Content Creator'], `New quiz available: "${quiz.title}"${quiz.dueDate ? ` — due ${quiz.dueDate}` : ''}`);
  };
  const updateQuiz = (id, updates) => setQuizzes(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  const deleteQuiz = (id) => setQuizzes(prev => prev.filter(q => q.id !== id));
  const submitQuizAttempt = (quizId, score, total) => {
    setQuizAttempts(prev => [...prev, { id: Date.now(), quizId, userId: currentUser.id, score, total, date: new Date().toISOString().split('T')[0] }]);
    const quiz = quizzes.find(q => q.id === quizId);
    const pct = Math.round(score / total * 100);
    notifyRoles([currentUser.role], `Quiz "${quiz?.title ?? 'Quiz'}" submitted — Score: ${score}/${total} (${pct}%)`);
    notifyRoles(['Admin', 'Instructor'], `${currentUser.name} completed quiz "${quiz?.title ?? 'Quiz'}" — ${pct}%`);
  };
  const getQuizAttempts = (quizId, userId) => quizAttempts.filter(a => a.quizId === quizId && a.userId === (userId ?? currentUser?.id));

  // ── CERTIFICATES ──────────────────────────────────────────────────────────
  const issueCertificate = (userId, courseId) => {
    const exists = certificates.find(c => c.userId === userId && c.courseId === courseId);
    if (!exists) setCertificates(prev => [...prev, { id: Date.now(), userId, courseId, date: new Date().toISOString().split('T')[0] }]);
  };
  const hasCertificate = (userId, courseId) => !!certificates.find(c => c.userId === userId && c.courseId === courseId);

  // ── MESSAGES ───────────────────────────────────────────────────────────────
  const sendMessage = (toId, subject, body) => {
    const recipient = users.find(u => u.id === toId);
    const newMsg = {
      id: Date.now(),
      fromId: currentUser.id,
      fromName: currentUser.name,
      fromRole: currentUser.role,
      fromInitials: currentUser.initials,
      toId,
      toName: recipient?.name ?? 'Unknown',
      subject: subject || '(No subject)',
      body,
      sentAt: new Date().toISOString(),
      readByTo: false,
      deletedBySender: false,
      deletedByRecipient: false,
    };
    setMessages(prev => [newMsg, ...prev]);
    notifyRoles([recipient?.role], `New message from ${currentUser.name}: "${subject || '(No subject)'}"`);
  };
  const markMessageRead = (id) => setMessages(prev => prev.map(m => m.id === id ? { ...m, readByTo: true } : m));
  const deleteMessage = (id, asSender) => setMessages(prev =>
    prev.map(m => m.id === id ? { ...m, ...(asSender ? { deletedBySender: true } : { deletedByRecipient: true }) } : m)
  );
  const getInbox = () => messages.filter(m => m.toId === currentUser?.id && !m.deletedByRecipient);
  const getSent = () => messages.filter(m => m.fromId === currentUser?.id && !m.deletedBySender);
  const unreadCount = () => getInbox().filter(m => !m.readByTo).length;

  return (
    <AppContext.Provider value={{
      // auth
      currentUser, login, register, logout, forceReseed,
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
      // update assignment (for calendar deadline edits)
      updateAssignment,

      // content items
      contentItems, addContent, updateContent, deleteContent,
      // notifications
      notifications, setNotifications,
      // ratings
      ratings, addRating, getCourseRating, getUserRating,
      // progress
      courseProgress, markLessonDone, getCourseProgress,
      // quizzes
      quizzes, addQuiz, updateQuiz, deleteQuiz,
      quizAttempts, submitQuizAttempt, getQuizAttempts,
      // certificates
      certificates, issueCertificate, hasCertificate,
      // messages / help
      messages, sendMessage, markMessageRead, deleteMessage, getInbox, getSent, unreadCount,

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
