import React, { useState } from 'react';
import Menu from './components/menu';
import MainContent from './components/maincontent';

function App() {
  const [editMode,] = useState(false);
  return (
    <div className="App">
      <div className="app-body">
        <Menu />
        <MainContent editMode={editMode} />
      </div>
    </div>
  );
}
export default App;
