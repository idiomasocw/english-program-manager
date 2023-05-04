import React, { useState, useEffect } from 'react';
import './styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTrash } from '@fortawesome/free-solid-svg-icons';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';


const Menu = ({ editMode, selectedLesson, setSelectedLesson, onDeleteLesson }) => {
  const [lessons, setLessons] = useState([]);
  const [collapsed, setCollapsed] = useState(true);
  const [levelA1, setLevelA1] = useState(false);
  const [levelA2, setLevelA2] = useState(false);
  const [levelB1, setLevelB1] = useState(false);
  const [levelB2, setLevelB2] = useState(false);
  const [levelC1, setLevelC1] = useState(false);
  
  /* deletion component */
  const handleDeleteLesson = (e,lessonId) => {
    e.stopPropagation();
      onDeleteLesson(lessonId);
  };
  

  const toggleMenu = (e) => {
    if (e.target.closest('.level-button') || e.target.closest('.lessons')) {
      return;
    }
    setCollapsed(!collapsed);
  };
  

  const toggleLevel = (level) => {
    if (collapsed) {
      setCollapsed(false);
    }

    if (level === 'A1') setLevelA1(!levelA1);
    else if (level === 'A2') setLevelA2(!levelA2);
    else if (level === 'B1') setLevelB1(!levelB1);
    else if (level === 'B2') setLevelB2(!levelB2);
    else if (level === 'C1') setLevelC1(!levelC1);
  };

  const getLevelState = (level) => {
    if (level === 'A1') return levelA1;
    else if (level === 'A2') return levelA2;
    else if (level === 'B1') return levelB1;
    else if (level === 'B2') return levelB2;
    else if (level === 'C1') return levelC1;
  };

  useEffect(() => {
    const q = query(collection(db, 'lesson'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const lessonsData = [];
      querySnapshot.forEach((doc) => {
        lessonsData.push({ id: doc.id, ...doc.data() });
      });
      setLessons(lessonsData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <nav className={`menu ${collapsed ? 'collapsed' : ''}`} aria-label="Language levels menu">
      <div className="menu-hamburger" onClick={toggleMenu}>
        <FontAwesomeIcon
          icon={faBars}
          size="lg"
          style={{ color: '#0e124d' }}
        />
      </div>
      {['A1', 'A2', 'B1', 'B2', 'C1'].map((level, idx) => (
        <div className="level" key={idx}>
          <button className="level-button" onClick={() => toggleLevel(level)}>
            {level}
          </button>
          <ul className={`lessons ${getLevelState(level) ? '' : 'hidden'}`}>
          {lessons
              .filter((lesson) => lesson.tag === level)
              .map((lesson, lessonIdx) => (
                <li key={lessonIdx} 
                className="lesson"
                onClick={() => setSelectedLesson(lesson)}
                >
                  {lesson.title}
                  {editMode && (
                    <FontAwesomeIcon
                      className="delete-lesson"
                      icon={faTrash}
                      size="xs"
                      style={{ color: '#5075b4' }}
                      onClick={(e) => handleDeleteLesson(e,lesson.id)}
                    />
                  )}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </nav>
  );
};

export default Menu;