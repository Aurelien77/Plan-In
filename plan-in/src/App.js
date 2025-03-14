import { useState, useEffect } from 'react';
import './App.css';
import logo from './assets/logo.jpg';

const App = () => {
  const [schedule, setSchedule] = useState({});
  const [persons] = useState(['Jean', 'Marie', 'Paul', 'Sophie']);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSemester, setSelectedSemester] = useState(1); // 1 pour 1er semestre, 2 pour 2e semestre

  // Fonction pour générer le planning en fonction de l'année et du semestre
  const generateSchedule = (year, semester) => {
    let startDate, endDate;
    if (semester === 1) {
      startDate = new Date(year, 0, 1); // Janvier
      endDate = new Date(year, 5, 30); // Juin
    } else {
      startDate = new Date(year, 6, 1); // Juillet
      endDate = new Date(year, 11, 31); // Décembre
    }

    const newSchedule = {};
    let currentPersonIndex = 0;

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const day = date.getDay();

      if (day === 2 || day === 4) { // Mardi et Jeudi
        const key = date.toDateString();

        // Assigner la même personne pour le mardi et le jeudi suivant
        if (day === 2) {
          newSchedule[key] = persons[currentPersonIndex % persons.length];
        } else if (day === 4) {
          const previousTuesday = new Date(date);
          previousTuesday.setDate(date.getDate() - 2);
          const previousKey = previousTuesday.toDateString();
          newSchedule[key] = newSchedule[previousKey] || persons[currentPersonIndex % persons.length];
          currentPersonIndex++;
        }
      }
    }

    setSchedule(newSchedule);
  };

  // Fonction pour gérer le changement de l'année
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
    generateSchedule(event.target.value, selectedSemester);
  };

  // Fonction pour gérer le changement du semestre
  const handleSemesterChange = (event) => {
    setSelectedSemester(Number(event.target.value));
    generateSchedule(selectedYear, Number(event.target.value));
  };

  // Groupement des données par mois
  const groupByMonth = () => {
    const grouped = {};

    Object.keys(schedule).forEach(dateStr => {
      const date = new Date(dateStr);
      const month = date.toLocaleString('default', { month: 'long' });

      if (!grouped[month]) {
        grouped[month] = [];
      }

      grouped[month].push({ date: date.getDate(), person: schedule[dateStr], day: date.toLocaleString('default', { weekday: 'long' }) });
    });

    return grouped;
  };

  const renderSchedule = () => {
    const grouped = groupByMonth();

    return Object.keys(grouped).map(month => (
      <div key={month} className="month-section">
        <h2 className='month'>{month.toUpperCase()}</h2>
        <table>
          <thead>
          </thead>
          <tbody>
            {grouped[month].map((entry, index) => (
              <tr key={index}>
                <div className='data'>
                <td>{entry.day} {entry.date}</td>
                <td>{entry.person}</td>
                </div>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ));
  };

  // Utilisation de useEffect pour générer le planning dès le chargement de la page
  useEffect(() => {
    generateSchedule(selectedYear, selectedSemester);
  }, []); // Le tableau vide [] garantit que l'effet se déclenche uniquement lors du premier rendu

  return (
    <div className="app-container">
      {/* Sélecteur d'année */}
{/*       <select onChange={handleYearChange} value={selectedYear} className="year-selector">
        <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
        <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
        <option value={new Date().getFullYear() + 2}>{new Date().getFullYear() + 2}</option>
      </select> */}

      {/* Sélecteur de semestre */}
      <select onChange={handleSemesterChange} value={selectedSemester} className="semester-selector">
        <option value={1}>1er Semestre (Janvier à Juin)</option>
        <option value={2}>2ème Semestre (Juillet à Décembre)</option>
      </select>

      <div className='flex'>
        <img src={logo} id="logo" alt="Logo" />
        <h1>PLANNING DE NETTOYAGE DES PARTIES COMMUNES</h1>
      </div>

      <div className='selectedsemestre'>
        {selectedSemester === 1 ? `1er SEMESTRE - ANNEE ${selectedYear}` : `2ème SEMESTRE - ANNEE ${selectedYear}`}
      </div>

      {/* Affichage du planning */}
      <div className="schedule-display">
        {renderSchedule()}
      </div>
    </div>
  );
};

export default App;
