import React, { useState } from 'react';
import MainContent from './components/maincontent';

function App() {
  const [editMode,] = useState(false);
  return (
    <div className="App">
      <div className="app-body">
        <MainContent editMode={editMode} />
      </div>
    </div>
  );
}
export default App;
