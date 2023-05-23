import React, { useState, useEffect } from 'react';
import Menu from './menu';
import './styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faMagnifyingGlass, faToggleOff, faToggleOn, faPenToSquare,faSpinner,faRectangleXmark,faDownload} from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
// import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from '../firebase-config';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the styles
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


Modal.setAppElement('#root');
const MainContent = () => {
    const [editMode, setEditMode] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tag, setTag] = useState('');
/*     const [tags, setTags] = useState([]);*/
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);
    const [editingTag, setEditingTag] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [tempDescription, setTempDescription] = useState('');
    const [tempTag, setTempTag] = useState('');
    const [loading, setLoading] = useState(false);
    const hasTextContent = (html) => {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent.trim() !== '';
    };
    
    const isFormValid = () => {
        return title.trim() !== "" && tag.trim() !== "" && hasTextContent(description);
    };

    //Begin download function
    const downloadLessonAsPDF = async () => {
        if (selectedLesson) {
            const input = document.querySelector('.lesson-details'); // This should target the container of the lesson content
            const canvas = await html2canvas(input);
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            pdf.addImage(imgData, 'PNG', 0, 0);
            pdf.save(`${selectedLesson.title}.pdf`);
        }
    };
    //End of download function
    
    /* delettion prop */
    const deleteLesson = async (lessonId) => {
        console.log('deleteLesson called');
        if (window.confirm('Do you really want to delete this lesson?')) {
            try {
                await deleteDoc(doc(db, 'lesson', lessonId));
                console.log('Document deleted with ID:', lessonId);
                //fetchLessons();
                //setSelectedLesson(null); // Deselect the deleted lesson 
            } catch (error) {
                console.error('Error deleting document:', error);
            }
        }
    };

    const [selectedLesson, setSelectedLesson] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [filteredLessons, setFilteredLessons] = useState([]);
    const fetchLessons = async () => {
        const querySnapshot = await getDocs(collection(db, 'lesson'));
        const lessonsData = [];
        querySnapshot.forEach((doc) => {
            lessonsData.push({ id: doc.id, ...doc.data() });
        });
        setLessons(lessonsData);
    };
    useEffect(() => {
        setTempDescription(selectedLesson?.description || '');
    }, [selectedLesson]);
    
    useEffect(() => {
        fetchLessons();
    }, []);
    const handleSearchInput = (e) => {
        setSearchText(e.target.value);
        const searchValue = e.target.value.toLowerCase();
        const filtered = lessons.filter((lesson) => {
            return (
                lesson.title.toLowerCase().includes(searchValue) ||
                lesson.description.toLowerCase().includes(searchValue) ||
                lesson.tag.toLowerCase().includes(searchValue)
            );
        });
        setFilteredLessons(filtered);
    };
    const handleLessonClick = (lesson) => {
        setSelectedLesson(lesson);
        setSearchText('');
        setFilteredLessons([]);
    };
    const toggleEditMode = () => {
        if (editMode && editingDescription) {
            saveDescription();
        }
        setEditMode(!editMode);
    };
    
    const enabledButtonStyle = {
        backgroundColor: '#0e124d', // Change this to the desired dark blue color
        color: '#f8fbfb', // Change the text color to white or any desired color
        borderRadius: '5px',
        cursor: 'pointer',
      };
      const disabledButtonStyle = {
        backgroundColor: '#d1dbe3', // Change this to a gray color or any other color for the disabled state
        color: '#fafafa', // Change the text color to white or any desired color
        borderRadius: '5px',
        cursor: 'not-allowed',
      };
      
      
    const handleAddLesson = () => {
        setModalIsOpen(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading
        // Add your Firebase code here to store the data
        try {
            const docRef = await addDoc(collection(db, 'lesson'), {
                title: title,
                description: description,
                tag:tag,
            });
            console.log('Document written with ID: ', docRef.id);
            // Fetch the new lesson data and update the 'lessons' state
        const docSnapshot = await docRef.get();
        const newLesson = { id: docSnapshot.id, ...docSnapshot.data() };
        setLessons((prevLessons) => [...prevLessons, newLesson]);

        } catch (e) {
            console.error('Error adding document: ', e);
        }
        setTitle('');
        setDescription('');
        setTag('');
        setLoading(false);
        setModalIsOpen(false);
    };
    console.log('Selected lesson tag:', selectedLesson?.tag);
    // Add these handler functions inside MainContent component
    const handleTitleEdit = () => {
        setTempTitle(selectedLesson.title);
        setEditingTitle(true);
    };
    const handleDescriptionEdit = () => {
        setTempDescription(selectedLesson.description);
        setEditingDescription(true);
    };
    const handleTagEdit = () => {
        setTempTag(selectedLesson.tag);
        setEditingTag(true);
    };
    const handleTitleChange = (e) => {
        setTempTitle(e.target.value);
    };
    const handleDescriptionChange = (value) => {
        setTempDescription(value);
    };
    const handleTagChange = (e) => {
        setTempTag(e.target.value);
    };
    const saveTitle = async () => {
        await updateDoc(doc(db, 'lesson', selectedLesson.id), {
            title: tempTitle,
        });
        setSelectedLesson({ ...selectedLesson, title: tempTitle });
        setEditingTitle(false);
    };
    const saveDescription = async () => {
        await updateDoc(doc(db, 'lesson', selectedLesson.id), {
            description: tempDescription,
        });
        setSelectedLesson({ ...selectedLesson, description: tempDescription });
        setEditingDescription(false);
    };
    const saveTag = async () => {
        await updateDoc(doc(db, 'lesson', selectedLesson.id), {
            tag: tempTag,
        });
        setSelectedLesson({ ...selectedLesson, tag: tempTag });
        setEditingTag(false);
    };
    return (
        <div className="main-content">
            
            <div className="toggle-container">
                {editMode && (
                    <FontAwesomeIcon
                        className="add-lesson"
                        icon={faCirclePlus}
                        size="xl"
                        style={{color:'#0e124d'}}
                        onClick={handleAddLesson}
                    />
                )}
                <span id="edit-tag">Edit Mode</span>
                {editMode ? (
                    <FontAwesomeIcon
                        icon={faToggleOn}
                        size="lg"
                        style={{ color: '#3562b1' }}
                        onClick={toggleEditMode}
                    />
                ) : (
                    <FontAwesomeIcon
                        icon={faToggleOff}
                        size="lg"
                        style={{ color: '#647eaa' }}
                        onClick={toggleEditMode}
                    />
                )}
            </div>
            <nav className='navigation-bar'>            
                
                <div className='search-bar-container'>
                <div className="search-bar-wrapper">                    
                <input
                    className="search-bar"
                    type="text"
                    value={searchText}
                    onChange={handleSearchInput}
                    placeholder="Search lessons"
                />
                <FontAwesomeIcon className='search-icon' icon={faMagnifyingGlass} size="sm" style={{ color: '#0e124d' }} /></div>
                </div>
            </nav>
            <Menu editMode={editMode}
                selectedLesson={selectedLesson}
                setSelectedLesson={setSelectedLesson}
                onDeleteLesson={deleteLesson} />
            {filteredLessons.length > 0 ? (
                <div className="search-results">
                    {filteredLessons.map((lesson) => (
                        <div
                            key={lesson.id}
                            className="search-result"
                            onClick={() => handleLessonClick(lesson)}
                        >
                            {`${lesson.title} (${lesson.tag})`}
                        </div>
                    ))}
                </div>
            ) : selectedLesson ? (
                <div className="lesson-details">
                    <div className="lessonHeadingSection">
                    <FontAwesomeIcon 
                    icon={faDownload} 
                    size="lg"
                    style={{ marginRight: "8px", cursor: "pointer", color:'#4827ec' }} 
                    onClick={downloadLessonAsPDF}
                    />
                <h1>
                  {editingTitle ? (
                    <input value={tempTitle} onChange={handleTitleChange} onBlur={saveTitle} />
                  ) : (
                    <>
                      {selectedLesson.title}
                      {editMode && (
                        <FontAwesomeIcon
                          icon={faPenToSquare}
                          size="2xs"
                          style={{ marginLeft: "8px", cursor: "pointer", color:'#4827ec' }}
                          onClick={handleTitleEdit}
                        />
                      )}
                    </>
                  )}
                </h1></div>
                <div className='quill-area'>
                {editingDescription ? (
    editMode ? (
        <ReactQuill value={tempDescription} onChange={handleDescriptionChange} />
    ) : (
        <div dangerouslySetInnerHTML={{ __html: selectedLesson.description }} />
    )
) : (
    <>
        <div dangerouslySetInnerHTML={{ __html: selectedLesson.description }} />
        {editMode && (
            <FontAwesomeIcon
                icon={faPenToSquare}
                style={{ marginLeft: "8px", cursor: "pointer", color:'#4827ec' }}
                onClick={handleDescriptionEdit}
            />
        )}
    </>
)}
                </div>
                <p>
                  Level: 
                  {editingTag ? (
                    <select 
                    value={tempTag} 
                    onChange={handleTagChange} 
                    onBlur={saveTag} 
                     >
                     <option value="">Select a level</option>
                     <option value="A1">A1</option>
                     <option value="A2">A2</option>
                     <option value="B1">B1</option>
                     <option value="B2">B2</option>
                     <option value="C1">C1</option>
                     </select>
                  ) : (
                    <>
                      {selectedLesson.tag}
                      {editMode && (
                        <FontAwesomeIcon
                          icon={faPenToSquare}
                          style={{ marginLeft: "8px", cursor: "pointer", color:'#4827ec' }}
                          onClick={handleTagEdit}
                        />
                      )}
                    </>
                  )}
                </p>
              </div>
                
            ) : null}
            <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}
            style={{
                overlay:{backgroundColor:'rgba(0, 0, 0, 0.5)',
            },
            content: {
                backgroundColor: '#edf7ff', // Set the content background color to light blue
                // Add any additional content styles you may need
                padding: '20px',
              },   
            }}>
            <div className="form-wrapper">
            <div className="form-header">
                <h2>Add Lesson</h2>
                <FontAwesomeIcon
                icon={faRectangleXmark}
                size="2xl"
                style={{ color: '#0e124d', cursor: 'pointer' }}
                onClick={() => setModalIsOpen(false)}/>
                </div>
                <form
                    className="form-container"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (isFormValid()) {
                            handleSubmit(e);
                        }
                    }}
                >
                    <label className="formTitle" htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                <label className="formDescription" htmlFor="description">Description</label>
                <ReactQuill
                value={description}
                onChange={(value) => setDescription(value)}
                />
                                        
                {loading ? (
                <div className="loading-icon">
                <FontAwesomeIcon icon={faSpinner} spin size="2xl" />
                </div>
                ) : null}
<label className="formLevel" htmlFor="tag">
  Level
</label>
<select
  id="tag"
  value={tag}
  onChange={(e) => setTag(e.target.value)}
  required
>
  <option value="">Select a level</option>
  <option value="A1">A1</option>
  <option value="A2">A2</option>
  <option value="B1">B1</option>
  <option value="B2">B2</option>
  <option value="C1">C1</option>
</select>
<br></br>
                    <button
  type="submit"
  style={isFormValid() ? enabledButtonStyle : disabledButtonStyle}
  disabled={!isFormValid()}>
  Submit
</button>
                </form>
                </div>
            </Modal>
        </div>
    );
};
export default MainContent;