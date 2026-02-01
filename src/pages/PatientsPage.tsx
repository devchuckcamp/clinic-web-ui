import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from '@mui/material/Avatar';
import SearchIcon from '@mui/icons-material/Search';
import { Card, CardContent, Loading, Alert } from '@/components/common';
import { patientsService } from '@/services';
import type { Patient } from '@/types';

export function PatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchPatients() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await patientsService.listPatients();
        setPatients(response.items);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load patients';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPatients();
  }, []);

  const getPatientName = (patient: Patient): string => {
    if (patient.firstName || patient.lastName) {
      return `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
    }
    return patient.patientId;
  };

  const getPatientInitials = (patient: Patient): string => {
    if (patient.firstName && patient.lastName) {
      return `${patient.firstName[0]}${patient.lastName[0]}`.toUpperCase();
    }
    if (patient.firstName) {
      return patient.firstName[0].toUpperCase();
    }
    return patient.patientId.substring(0, 2).toUpperCase();
  };

  const filteredPatients = patients.filter((p) => {
    const name = getPatientName(p).toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || p.patientId.toLowerCase().includes(query);
  });

  const handlePatientClick = (patientId: string) => {
    navigate(`/patients/${patientId}/notes`);
  };

  if (isLoading) {
    return (
      <Box className="snoremd-patients-page-loading" sx={{ py: 6 }}>
        <Loading size="lg" text="Loading patients..." />
      </Box>
    );
  }

  return (
    <Box className="snoremd-patients-page" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box className="snoremd-patients-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold" className="snoremd-patients-title">
          Patients
        </Typography>
      </Box>

      {error && (
        <Alert type="error" onClose={() => setError(null)} className="snoremd-patients-error">
          {error}
        </Alert>
      )}

      {/* Search */}
      <TextField
        placeholder="Search patients by name or ID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        size="small"
        className="snoremd-patients-search-input"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Patient List */}
      <Box className="snoremd-patients-list-section">
        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }} className="snoremd-patients-count">
          Patients ({filteredPatients.length})
        </Typography>
        {filteredPatients.length > 0 ? (
          <Grid container spacing={2} className="snoremd-patients-grid">
            {filteredPatients.map((patient) => (
              <Grid item xs={12} md={6} lg={4} key={patient.patientId} className="snoremd-patients-grid-item">
                <Card hoverable onClick={() => handlePatientClick(patient.patientId)} className="snoremd-patient-card">
                  <CardContent className="snoremd-patient-card-content">
                    <Box className="snoremd-patient-card-row" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }} className="snoremd-patient-avatar">
                        {getPatientInitials(patient)}
                      </Avatar>
                      <Box className="snoremd-patient-info" sx={{ ml: 2 }}>
                        <Typography variant="body1" fontWeight="medium" className="snoremd-patient-name">
                          {getPatientName(patient)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" className="snoremd-patient-id">
                          {patient.patientId}
                        </Typography>
                        {patient.dateOfBirth && (
                          <Typography variant="caption" color="text.secondary" className="snoremd-patient-dob">
                            DOB: {patient.dateOfBirth}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : patients.length === 0 ? (
          <Box className="snoremd-patients-empty" sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" className="snoremd-patients-empty-message">
              No patients found in your clinic.
            </Typography>
          </Box>
        ) : (
          <Box className="snoremd-patients-no-results" sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" className="snoremd-patients-no-results-message">
              No patients found matching your search.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
