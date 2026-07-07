import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../CSS/index.css';
import '../CSS/About.css'; // Reusing about styles for lawyers grid

const Lawyers = () => {
    const [lawyers, setLawyers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [specialization, setSpecialization] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchLawyers();
    }, [searchTerm, specialization]);

    const fetchLawyers = async () => {
        try {
            let query = '/users/lawyers?';
            if (searchTerm) query += `keyword=${searchTerm}&`;
            if (specialization) query += `specialization=${specialization}`;
            
            const res = await api.get(query);
            setLawyers(res.data);
        } catch (error) {
            console.error('Failed to fetch lawyers', error);
        }
    };

    return (
        <div>
            <div className="team" style={{ paddingBottom: '20px' }}>
                <h1>Our Legal Experts Directory</h1>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                    <input 
                        type="text" 
                        placeholder="Search by name or keyword..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '10px', width: '300px' }}
                    />
                    <select 
                        value={specialization} 
                        onChange={(e) => setSpecialization(e.target.value)}
                        style={{ padding: '10px' }}
                    >
                        <option value="">All Specializations</option>
                        <option value="Criminal Law">Criminal Law</option>
                        <option value="Civil Litigation">Civil Litigation</option>
                        <option value="Corporate Law">Corporate Law</option>
                        <option value="Family & Divorce Law">Family & Divorce Law</option>
                    </select>
                </div>
            </div>

            <div className="lawyers">
                {lawyers.map((lawyer, index) => (
                    <div className={`lawyer-${(index % 4) + 1}`} key={lawyer._id}>
                        <h3>{lawyer.user?.name}</h3>
                        <div className="left">
                            <img src={`/Asstes/Lawyer${(index % 2) + 1}.png`} alt={lawyer.user?.name} />
                        </div>
                        <div className="right">
                            <p>Rating: {lawyer.rating} / 5</p>
                            <p>Speciality: {lawyer.specialization.join(', ')}</p>
                            <p>Experience: {lawyer.experience} Years</p>
                            <p>Consultation Fee: ₹{lawyer.consultationFee}</p>
                            <button 
                                onClick={() => navigate('/booking')} 
                                style={{ marginTop: '10px', padding: '8px 16px', background: '#b8944d', color: 'white', border: 'none', cursor: 'pointer' }}
                            >
                                Book Appointment
                            </button>
                        </div>
                    </div>
                ))}
                
                {lawyers.length === 0 && (
                    <p style={{ textAlign: 'center', width: '100%' }}>No lawyers found matching your criteria.</p>
                )}
            </div>
        </div>
    );
};

export default Lawyers;
