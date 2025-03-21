import { useState, useEffect } from 'react';
import './App.css';
import logo from './assets/logo.jpg';

const App = () => {
  const [schedule, setSchedule] = useState({});
  const [persons, setPersons] = useState(['DOMART', 'KHAUV', 'MOMPEROUSSE', 'KUPCIC','PORCHERON','MUNIER-RODRIGUEZ','MONCEAU','NAJIM']);
  const [newPerson, setNewPerson] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSemester, setSelectedSemester] = useState(1); // 1 pour 1er semestre, 2 pour 2e semestre
  const [showPersonList, setShowPersonList] = useState(false); // Contrôle la visibilité de la liste
  const [Afficheconf, setAfficheconf] = useState(false);
  const [highlightToday, setHighlightToday] = useState(false);

  // Fonction pour générer le planning en fonction de l'année et du semestre
  const toggleHighlightToday = () => {
    setHighlightToday(!highlightToday);
  };
  
  const generateSchedule = (year, semester) => {
    let startDate, endDate;
  
    if (semester === 1) {
      startDate = new Date(year, 0, 1); // Janvier
      endDate = new Date(year, 5, 30); // Juin
    } else {
      startDate = new Date(year, 6, 1); // Juillet
      endDate = new Date(year, 11, 31); // Décembre
    }
  
    // Fonction pour compter le nombre d'assignations passées
    const calculatePreviousAssignments = (targetYear, targetSemester) => {
      let totalAssignments = 0;
  
      for (let y = 2025; y < targetYear; y++) { // 2023 = année de début (ajustez si nécessaire)
        totalAssignments += countYearlyAssignments(y);
      }
  
      if (targetSemester === 2) {
        totalAssignments += countSemesterAssignments(targetYear, 1);
      }
  
      return totalAssignments;
    };
  
 
  
  // Fonction pour compter les affectations d'un semestre
const countSemesterAssignments = (year, semester) => {
  let count = 0;
  
  // Déterminer la date de début du semestre
  let tempDate = new Date(year, semester === 1 ? 0 : 6, 1);  // 0 pour janvier, 6 pour juillet
  
  // Utiliser la méthode "new Date(year, month + 1, 0)" pour obtenir le dernier jour du mois
  let endDate = new Date(year, semester === 1 ? 6 : 12, 0);  // 6 pour juin, 12 pour décembre
  
  // Itérer à travers tous les jours du semestre (du 1er jour au dernier jour)
  for (; tempDate <= endDate; tempDate.setDate(tempDate.getDate() + 1)) {
    if (tempDate.getDay() === 1 || tempDate.getDay() === 4) {  // Lundi ou Jeudi
      if (tempDate.getDay() === 4) count++;  // Compter uniquement les jeudis
    }
  }

  return count;
};

// Fonction pour compter les affectations d'une année complète
const countYearlyAssignments = (year) => {
  return countSemesterAssignments(year, 1) + countSemesterAssignments(year, 2);
};

  
    // Déterminer où on s'était arrêté
    let currentPersonIndex = calculatePreviousAssignments(year, semester);
  
    const newSchedule = {};
  
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const day = date.getDay();
  
      if (day === 1 || day === 4) { // Lundi et Jeudi
        const key = date.toDateString();
  
        if (day === 1) {
          newSchedule[key] = persons[currentPersonIndex % persons.length];
        } else if (day === 4) {
          const previousTuesday = new Date(date);
          previousTuesday.setDate(date.getDate() - 3);
          const previousKey = previousTuesday.toDateString();
          newSchedule[key] = newSchedule[previousKey] || persons[currentPersonIndex % persons.length];
          currentPersonIndex++;
        }
      }
    }
  
    setSchedule(newSchedule);
  };
  

  

  // Fonction pour gérer le changement du semestre
  const handleSemesterChange = (event) => {
    setSelectedSemester(Number(event.target.value));
    generateSchedule(selectedYear, Number(event.target.value));
  };



  // Fonction pour ajouter une nouvelle personne à la liste
  const handleAddPerson = () => {
    if (newPerson.trim() !== '') {
      setPersons([...persons, newPerson]);
      setNewPerson(''); // Réinitialiser le champ après ajout
    }
  };

  // Fonction pour retirer une personne de la liste
  const handleRemovePerson = (personToRemove) => {
    setPersons(persons.filter(person => person !== personToRemove));
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
    const todayStr = new Date().toDateString(); 
    return Object.keys(grouped).map(month => {
      const entries = grouped[month];
      const firstEntry = entries[0];
      let skipNext = false;
    
      return (
        <div key={month} className="table_generated">
          <h2 className="month">{month.toUpperCase()}</h2>
          <table>
            <tbody>
              {entries.map((entry, index, array) => {
                if (skipNext) {
                  skipNext = false;
                  return null;
                }
    
                const monthIndex = new Date(`${month} 1, ${selectedYear}`).getMonth();
          
                const entryDate = new Date(selectedYear, monthIndex, entry.date);
                const isToday = highlightToday && entryDate.toDateString() === todayStr;
                let today = new Date();
                let nextMondayOrThursday = new Date(today);
                
                // Si aujourd'hui n'est pas lundi (1) ou jeudi (4), cherche le prochain
                while (nextMondayOrThursday.getDay() !== 1 && nextMondayOrThursday.getDay() !== 4) {
                  nextMondayOrThursday.setDate(nextMondayOrThursday.getDate() + 1);
                }
                
                // Vérifier si l'entrée du planning correspond au prochain lundi ou jeudi
                const isNextPlannedDay = highlightToday && entryDate.toDateString() === nextMondayOrThursday.toDateString();  
                if (index === 0 && firstEntry.day === "jeudi") {
                  return (
<tr key={index} className={`data ${isToday || isNextPlannedDay ? "highlight" : ""}`.trim()}>

                      <td className='date'>{entry.day} {entry.date}</td>
                      <td className='personne'>{entry.person}</td>
                    </tr>
                  );
                }
    
                const nextEntry = array[index + 1];
    //Fusionne les cellules lundi et jeudi
                if (entry.day === "lundi" && nextEntry && nextEntry.day === "jeudi") {
                  skipNext = true;
                  return (
                    <tr key={index} className={`data ${isToday || isNextPlannedDay ? "highlight" : ""}`.trim()}>

                      <td className='date'>{entry.day} {entry.date}</td>
                      <td className='date'>{nextEntry.day} {nextEntry.date}</td>
                      <td className='personne'>{nextEntry.person}</td>
                    </tr>
                  );
                }
    
                return (
                  <tr key={index} className={`data ${isToday || isNextPlannedDay ? "highlight" : ""}`.trim()}>

                    <td className='date'>{entry.day} {entry.date}</td>
                    <td className='personne'>{entry.person}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    });
  };
  


  // Utilisation de useEffect pour générer le planning dès le chargement de la page
  useEffect(() => {
    generateSchedule(selectedYear, selectedSemester);
  }, []); // Le tableau vide [] garantit que l'effet se déclenche uniquement lors du premier rendu

  const handleBackYear = () => {
    const nextYear = selectedYear - 1;
    setSelectedYear(nextYear);
    generateSchedule(nextYear, selectedSemester);
  };
  
  const handleNextYear = () => {
    let nextYear = selectedYear + 1;
    let nextSemester = selectedSemester;
  
    // Si on est sur le 2e semestre, passer au 1er semestre de l'année suivante
    if (selectedSemester === 2) {
      nextSemester = 1;
    }
  
    setSelectedYear(nextYear);
    setSelectedSemester(nextSemester);
    generateSchedule(nextYear, nextSemester);
  };
  
  const handleBackToToday = () => {
    // Réinitialiser la date sur la date d'aujourd'hui
    setSelectedYear(new Date().getFullYear());
    setSelectedSemester(getCurrentSemester()); // Fonction pour déterminer le semestre actuel
    generateSchedule(new Date().getFullYear(), getCurrentSemester());
  };
  const getCurrentSemester = () => {
    const currentMonth = new Date().getMonth();
    return currentMonth < 6 ? 1 : 2; // Semestre 1 si mois avant juin, semestre 2 après
  };
  return (
    <div className="app-container">
        {/* Liste des personnes - visible uniquement si showPersonList est true */}
        {showPersonList && (
<>
    {/* Section pour ajouter des personnes */}
    <div className="person-input">
    <input 
      type="text" 
      value={newPerson} 
      onChange={(e) => setNewPerson(e.target.value)} 
      placeholder="Ajouter une personne" 
    />
    <button onClick={handleAddPerson}>Ajouter</button>
  </div>



        <div className="person-list">
    
          <ul className='person-list'>
            {persons.map((person, index) => (
              <li key={index}>
                {person}
                <button onClick={() => handleRemovePerson(person)} className="remove-button">Retirer</button>
              </li>
            ))}
          </ul>
        </div>
        </>
      )}

<button className='yearincourse' >
 Année en cours  <span className='red'>{selectedYear}</span>
</button>



<button id="conf" onClick={() => setAfficheconf(!Afficheconf)}>Conf</button>

{  Afficheconf &&     <>
 <div className='years'>
  
<button className="next-year-button" onClick={handleBackYear}>
Année Précédente
</button>

<button className="next-year-button" onClick={handleNextYear}>
Année suivante
</button>
<button className="back-to-today-button" onClick={handleBackToToday}>
 Refresh
</button> 
</div>  
 
     {/* Bouton pour afficher ou masquer la liste des personnes */}
     <div id='boutonpersonne'>
     <button className={showPersonList ?  "toggle-button-active" : "toggle-button" } onClick={() => setShowPersonList(!showPersonList)}>
     {showPersonList ? 'Masquer la liste des personnes' : 'Voir la liste des personnes'}
   </button>
   </div>
   </>
   
}




      {/* Sélecteur de semestre */}
      <div className='valueSemestre'>
        <button onClick={handleSemesterChange}  value={1} className='er'>1er Semestre </button>
        <button onClick={handleSemesterChange}  value={2} className='sd'>2ème Semestre</button>
        </div>
      
<div className='content'>
      <div className='flex'> 
        
         <button className="highlight-button" onClick={toggleHighlightToday}>
  {highlightToday ? "Désactiver la surbrillance" : "Prochain slot"}
</button>
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
<div className='informations'>
<div className='details'>
      <div className='detaila'>Lundi soir : sortir la poubelle ménagère</div> 
      <div className='detailb'>jeudi soir : sortir toutes les poubelles (ménagère et recycalge) </div>

  </div>
  <div className='details'>
      <div className='detaila'>Lorsque les poubelles sont à l'exterieur du local, c'est qu'elles n'ont pas été lavées, ne rien mettre dedans.</div>
      <div className='detailc'>Les poubelles doivent être nettoyées au plus tard le samedi midi.</div>
      </div></div>
    </div>
    </div>
  );
};

export default App;
