import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ROLES, ROLE_COLORS, COURSE_THUMBS } from '../utils/constants';
import * as api from '../utils/api';

const AppContext = createContext();

// Normalize course from API → add UI-only defaults (thumb, level, tags)
function normalizeCourse(c, index = 0) {
  return {
    ...c,
    thumb: c.thumb || COURSE_THUMBS[Math.abs(c.id || index) % COURSE_THUMBS.length],
    level: c.level || 'Beginner',
    tags: Array.isArray(c.tags) ? c.tags : (c.tags ? String(c.tags).split(',').map(t => t.trim()).filter(Boolean) : []),
    students: c.students || 0,
    lessons: c.lessons || 0,
    rating: c.rating || 0,
    duration: c.duration || '',
    description: c.description || '',
    category: c.category || 'General',
  };
}

export function AppProvider({ children }) {

  // ── State ────────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dbb_currentUser')); } catch { return null; }
  });
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [enrollments, setEnrollments] = useState({});
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dbb_notifications')) || []; } catch { return []; }
  });
  const [contentItems, setContentItems] = useState([]);
  const [quizzes, setQuizzes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dbb_quizzes')) || []; } catch { return []; }
  });
  const [quizAttempts, setQuizAttempts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dbb_quizAttempts')) || []; } catch { return []; }
  });
  const [ratings, setRatings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dbb_ratings')) || []; } catch { return []; }
  });
  const [courseProgress, setCourseProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dbb_courseProgress')) || {}; } catch { return {}; }
  });
  const [certificates, setCertificates] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dbb_certificates')) || []; } catch { return []; }
  });
  const [messages, setMessages] = useState([]);
  const [platformSettings, setPlatformSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dbb_platformSettings')) || {
        contactEmail: 'admin@gmail.com', contactPhone: '9100260825',
        aboutText: 'Welcome to Digital Black Board, the premier platform for modern learning management!',
      };
    } catch {
      return { contactEmail: 'admin@gmail.com', contactPhone: '9100260825', aboutText: '' };
    }
  });

  // Persist currentUser to localStorage
  useEffect(() => {
    if (currentUser) localStorage.setItem('dbb_currentUser', JSON.stringify(currentUser));
    else localStorage.removeItem('dbb_currentUser');
  }, [currentUser]);

  // Persist local-only state to localStorage
  useEffect(() => { localStorage.setItem('dbb_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('dbb_quizzes', JSON.stringify(quizzes)); }, [quizzes]);
  useEffect(() => { localStorage.setItem('dbb_quizAttempts', JSON.stringify(quizAttempts)); }, [quizAttempts]);
  useEffect(() => { localStorage.setItem('dbb_ratings', JSON.stringify(ratings)); }, [ratings]);
  useEffect(() => { localStorage.setItem('dbb_courseProgress', JSON.stringify(courseProgress)); }, [courseProgress]);
  useEffect(() => { localStorage.setItem('dbb_certificates', JSON.stringify(certificates)); }, [certificates]);
  useEffect(() => { localStorage.setItem('dbb_platformSettings', JSON.stringify(platformSettings)); }, [platformSettings]);

  // ── Load data from API on mount ──────────────────────────────────────────
  const refreshData = useCallback(async () => {
    try {
      const [usersData, coursesData, assignmentsData, submissionsData, announcementsData, contentData] =
        await Promise.all([
          api.apiGetUsers().catch(() => []),
          api.apiGetCourses().catch(() => []),
          api.apiGetAssignments().catch(() => []),
          api.apiGetSubmissions().catch(() => []),
          api.apiGetAnnouncements().catch(() => []),
          api.apiGetContent().catch(() => []),
        ]);
      setUsers(usersData);
      setCourses(coursesData.map((c, i) => normalizeCourse(c, i)));
      setAssignments(assignmentsData);
      setSubmissions(submissionsData);
      setAnnouncements(announcementsData);
      setContentItems(contentData);
    } catch (err) { console.error('Failed to load data from API:', err); }
  }, []);

  // Load messages for current user
  const refreshMessages = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [inbox, sent] = await Promise.all([
        api.apiGetInbox(currentUser.id).catch(() => []),
        api.apiGetSent(currentUser.id).catch(() => []),
      ]);
      // Merge inbox + sent, deduplicate by id
      const all = [...inbox, ...sent];
      const unique = Array.from(new Map(all.map(m => [m.id, m])).values());
      setMessages(unique);
    } catch (err) { console.error('Failed to load messages:', err); }
  }, [currentUser]);

  useEffect(() => { refreshData(); }, [refreshData]);
  useEffect(() => { refreshMessages(); }, [refreshMessages]);

  // ── Notifications (local only) ───────────────────────────────────────────
  const notifyRoles = (targetRoles, message) => {
    const newNotif = { id: Date.now() + Math.random(), text: message, targetRoles, time: 'Just now', read: false };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const updatePlatformSettings = (newSettings) => {
    setPlatformSettings(prev => ({ ...prev, ...newSettings }));
    if (currentUser) notifyRoles(['Admin'], `⚙️ ${currentUser.name} updated the platform information.`);
  };

  const forceReseed = () => {
    Object.keys(localStorage).filter(k => k.startsWith('dbb_')).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  // ── AUTH → API ────────────────────────────────────────────────────────────

  const login = async (email, password) => {
    try {
      const data = await api.apiLogin(email, password);
      setCurrentUser(data.user);
      await refreshData();
      return { user: data.user };
    } catch (err) {
      return { error: err.message };
    }
  };

  const register = async (nameOrObj, emailArg, passwordArg, roleArg) => {
    const { name, email, password, role } = (typeof nameOrObj === 'object' && nameOrObj !== null)
      ? nameOrObj
      : { name: nameOrObj, email: emailArg, password: passwordArg, role: roleArg };
    try {
      const data = await api.apiRegister({ name, email, password, role });
      setCurrentUser(data.user);
      setUsers(prev => [...prev, data.user]);
      notifyRoles(['Admin'], `New ${role} account created: ${name.trim()}`);
      return { user: data.user };
    } catch (err) {
      return { error: err.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dbb_currentUser');
  };

  // ── COURSES → API ─────────────────────────────────────────────────────────

  const addCourse = async (courseData) => {
    try {
      const newCourse = await api.apiCreateCourse({
        title: courseData.title, category: courseData.category,
        status: courseData.status || 'draft', description: courseData.description,
        duration: courseData.duration || '', lessons: courseData.lessons || 0,
        tags: courseData.tags || [], level: courseData.level || 'Beginner',
        createdBy: currentUser.id, createdByName: currentUser.name,
      });
      setCourses(prev => [normalizeCourse(newCourse), ...prev]);
      notifyRoles(['Admin'], `📚 ${currentUser.name} created a new course: ${courseData.title}`);
      return normalizeCourse(newCourse);
    } catch (err) { console.error('Add course error:', err); return null; }
  };

  const updateCourse = async (id, updates) => {
    try {
      const updated = await api.apiUpdateCourse(id, updates);
      setCourses(prev => prev.map(c => c.id === id ? normalizeCourse(updated) : c));
      notifyRoles(['Admin'], `📚 ${currentUser.name} updated a course`);
    } catch (err) { console.error('Update course error:', err); }
  };

  const deleteCourse = async (id) => {
    try {
      await api.apiDeleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      setAssignments(prev => prev.filter(a => a.courseId !== id));
    } catch (err) { console.error('Delete course error:', err); }
  };

  // ── SCOPED VIEWS ──────────────────────────────────────────────────────────
  const getAdminCourses = (adminId) => courses.filter(c => c.createdBy === adminId);
  const getPublishedCourses = () => courses.filter(c => c.status === 'published');
  const getEnrolledCourses = (studentId) => courses.filter(c => (enrollments[c.id] || []).includes(studentId));

  const getAdminAssignments = (adminId) => {
    const myCourseIds = new Set(getAdminCourses(adminId).map(c => c.id));
    return assignments.filter(a => myCourseIds.has(a.courseId));
  };
  const getStudentAssignments = (studentId) => {
    const enrolledIds = new Set(getEnrolledCourses(studentId).map(c => c.id));
    return assignments.filter(a => enrolledIds.has(a.courseId));
  };
  const getAdminSubmissions = (adminId) => {
    const myAssignmentIds = new Set(getAdminAssignments(adminId).map(a => a.id));
    return submissions.filter(s => myAssignmentIds.has(s.assignmentId));
  };

  // ── ENROLLMENTS → API ─────────────────────────────────────────────────────

  const enrollStudent = async (userId, courseId) => {
    if ((enrollments[courseId] || []).includes(userId)) return;
    try {
      const data = await api.apiEnrollStudent(courseId, userId);
      setEnrollments(prev => ({ ...prev, [courseId]: data.enrollments }));
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, students: (c.students || 0) + 1 } : c));
      const course = courses.find(c => c.id === courseId);
      notifyRoles(['Admin', 'Instructor'], `${currentUser?.name ?? 'A student'} enrolled in "${course?.title ?? 'a course'}"`);
    } catch (err) { console.error('Enroll error:', err); }
  };

  const isEnrolled = (userId, courseId) => !!(enrollments[courseId] || []).includes(userId);

  // Load enrollments for all courses on mount
  useEffect(() => {
    if (courses.length === 0) return;
    const loadEnrollments = async () => {
      const enrollMap = {};
      for (const c of courses) {
        try {
          const API_BASE = import.meta.env.VITE_API_URL || '/api';
          const data = await fetch(`${API_BASE}/courses/${c.id}/enrollment`).then(r => r.json());
          enrollMap[c.id] = data.enrolled || [];
        } catch { enrollMap[c.id] = []; }
      }
      setEnrollments(enrollMap);
    };
    loadEnrollments();
  }, [courses.length]);

  // ── ASSIGNMENTS → API ─────────────────────────────────────────────────────

  const addAssignment = async ({ title, courseId, dueDate, maxScore, description }) => {
    try {
      const newAssignment = await api.apiCreateAssignment({
        title, courseId: Number(courseId), dueDate, maxScore: Number(maxScore) || 100,
        description: description || '', createdBy: currentUser.id,
      });
      setAssignments(prev => [newAssignment, ...prev]);
      notifyRoles(['Admin', 'Instructor', 'Student'], `New assignment posted: "${title}" — due ${dueDate || 'TBD'}`);
      return newAssignment;
    } catch (err) { console.error('Add assignment error:', err); return null; }
  };

  const deleteAssignment = async (id) => {
    try {
      await api.apiDeleteAssignment(id);
      setAssignments(prev => prev.filter(a => a.id !== id));
      setSubmissions(prev => prev.filter(s => s.assignmentId !== id));
    } catch (err) { console.error('Delete assignment error:', err); }
  };

  const updateAssignment = async (id, updates) => {
    try {
      const updated = await api.apiUpdateAssignment(id, updates);
      setAssignments(prev => prev.map(a => a.id === id ? updated : a));
    } catch (err) { console.error('Update assignment error:', err); }
  };

  // ── SUBMISSIONS → API ─────────────────────────────────────────────────────

  const submitAssignment = async (assignmentId, studentId, studentName, studentInitials, answer, files = []) => {
    try {
      const newSub = await api.apiSubmitAssignment(
        { assignmentId, studentId, studentName, studentInitials, answer: answer || '' },
        files
      );
      setSubmissions(prev => [newSub, ...prev]);
      setAssignments(prev =>
        prev.map(a => a.id === assignmentId ? { ...a, submissions: (a.submissions || 0) + 1 } : a)
      );
      const assignment = assignments.find(a => a.id === assignmentId);
      notifyRoles(['Admin', 'Instructor'], `${studentName} submitted "${assignment?.title}"`);
      return { submission: newSub };
    } catch (err) {
      return { error: err.message };
    }
  };

  const gradeSubmission = async (id, score, feedback) => {
    try {
      const updated = await api.apiGradeSubmission(id, score, feedback);
      setSubmissions(prev => prev.map(s => s.id === id ? updated : s));
      if (updated.status === 'graded') {
        setAssignments(prev =>
          prev.map(a => a.id === updated.assignmentId ? { ...a, graded: (a.graded || 0) + 1 } : a)
        );
      }
    } catch (err) { console.error('Grade error:', err); }
  };

  // ── USERS → API ───────────────────────────────────────────────────────────

  const addUser = async (user) => {
    try {
      const newUser = await api.apiCreateUser(user);
      setUsers(prev => [newUser, ...prev]);
      notifyRoles(['Admin'], `New user added: ${user.name} (${user.role})`);
    } catch (err) { console.error('Add user error:', err); }
  };

  const updateUser = async (id, updates) => {
    try {
      const updated = await api.apiUpdateUser(id, updates);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
    } catch (err) { console.error('Update user error:', err); }
  };

  const deleteUser = async (id) => {
    try {
      await api.apiDeleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) { console.error('Delete user error:', err); }
  };

  const updateProfileName = async (newName) => {
    if (!currentUser) return;
    const newInitials = newName.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    try {
      await api.apiUpdateUser(currentUser.id, { name: newName, initials: newInitials });
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, name: newName, initials: newInitials } : u));
      setCurrentUser(prev => ({ ...prev, name: newName, initials: newInitials, nameChanged: true }));
    } catch (err) { console.error('Update profile error:', err); }
  };

  const updateUserAvatar = (userId, avatarStr) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, avatar: avatarStr } : u));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, avatar: avatarStr }));
    }
  };

  // ── CONTENT → API ─────────────────────────────────────────────────────────

  const addContent = async (item) => {
    try {
      const newItem = await api.apiCreateContent({
        ...item, createdBy: currentUser.id,
      });
      setContentItems(prev => [newItem, ...prev]);
    } catch (err) { console.error('Add content error:', err); }
  };

  const updateContent = async (id, updates) => {
    try {
      const updated = await api.apiUpdateContent(id, updates);
      setContentItems(prev => prev.map(c => c.id === id ? updated : c));
    } catch (err) { console.error('Update content error:', err); }
  };

  const deleteContent = async (id) => {
    try {
      await api.apiDeleteContent(id);
      setContentItems(prev => prev.filter(c => c.id !== id));
    } catch (err) { console.error('Delete content error:', err); }
  };

  // ── ANNOUNCEMENTS → API ───────────────────────────────────────────────────

  const addAnnouncement = async (ann) => {
    try {
      const newAnn = await api.apiCreateAnnouncement({
        title: ann.title, message: ann.message, priority: ann.priority,
        author: currentUser?.name, authorId: currentUser?.id,
      });
      setAnnouncements(prev => [newAnn, ...prev]);
      notifyRoles(['Admin', 'Instructor', 'Student', 'Content Creator'], `${currentUser?.name} posted: "${ann.title}"`);
    } catch (err) { console.error('Add announcement error:', err); }
  };

  // ── MESSAGES → API ────────────────────────────────────────────────────────

  const sendMessage = async (toId, subject, body) => {
    try {
      const newMsg = await api.apiSendMessage({
        fromId: currentUser.id, toId, subject, body,
      });
      setMessages(prev => [newMsg, ...prev]);
      const recipient = users.find(u => u.id === toId);
      notifyRoles([recipient?.role], `New message from ${currentUser.name}: "${subject || '(No subject)'}"`);
    } catch (err) { console.error('Send message error:', err); }
  };

  const markMessageRead = async (id) => {
    try {
      await api.apiMarkMessageRead(id);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, readByTo: true } : m));
    } catch (err) { console.error('Mark read error:', err); }
  };

  const deleteMessage = async (id, asSender) => {
    try {
      await api.apiDeleteMessage(id, asSender);
      setMessages(prev => prev.map(m => m.id === id
        ? { ...m, ...(asSender ? { deletedBySender: true } : { deletedByRecipient: true }) }
        : m
      ));
    } catch (err) { console.error('Delete message error:', err); }
  };

  const getInbox = () => messages.filter(m => m.toId === currentUser?.id && !m.deletedByRecipient);
  const getSent = () => messages.filter(m => m.fromId === currentUser?.id && !m.deletedBySender);
  const unreadCount = () => getInbox().filter(m => !m.readByTo).length;

  // ── RATINGS (local for now) ───────────────────────────────────────────────
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

  // ── PROGRESS (local for now) ──────────────────────────────────────────────
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

  // ── QUIZZES (local for now) ───────────────────────────────────────────────
  const addQuiz = (quiz) => {
    const newQ = { ...quiz, id: Date.now(), createdBy: currentUser.id, createdAt: new Date().toISOString().split('T')[0] };
    setQuizzes(prev => [newQ, ...prev]);
    notifyRoles(['Admin', 'Instructor', 'Student', 'Content Creator'], `New quiz available: "${quiz.title}"`);
  };
  const updateQuiz = (id, updates) => setQuizzes(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  const deleteQuiz = (id) => setQuizzes(prev => prev.filter(q => q.id !== id));
  const submitQuizAttempt = (quizId, score, total) => {
    setQuizAttempts(prev => [...prev, { id: Date.now(), quizId, userId: currentUser.id, score, total, date: new Date().toISOString().split('T')[0] }]);
    const quiz = quizzes.find(q => q.id === quizId);
    const pct = Math.round(score / total * 100);
    notifyRoles([currentUser.role], `Quiz "${quiz?.title ?? 'Quiz'}" submitted — Score: ${score}/${total} (${pct}%)`);
  };
  const getQuizAttempts = (quizId, userId) => quizAttempts.filter(a => a.quizId === quizId && a.userId === (userId ?? currentUser?.id));

  // ── CERTIFICATES (local for now) ──────────────────────────────────────────
  const issueCertificate = (userId, courseId) => {
    const exists = certificates.find(c => c.userId === userId && c.courseId === courseId);
    if (!exists) setCertificates(prev => [...prev, { id: Date.now(), userId, courseId, date: new Date().toISOString().split('T')[0] }]);
  };
  const hasCertificate = (userId, courseId) => !!certificates.find(c => c.userId === userId && c.courseId === courseId);

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
      // update assignment
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
      // messages
      messages, sendMessage, markMessageRead, deleteMessage, getInbox, getSent, unreadCount,
      // constants
      ROLE_COLORS, COURSE_THUMBS,
      // platform config
      platformSettings, updatePlatformSettings,
      // refresh
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);
