import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { partyService } from '../../services/partyService';
import JoinParty from '../../components/Party/JoinParty';

const JoinByCodePage = () => {
    const { inviteCode } = useParams<{ inviteCode: string }>();
    const navigate = useNavigate();
    const [isValidating, setIsValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (inviteCode) {
            validateAndJoin();
        } else {
            setError('Invalid invite link');
            setIsValidating(false);
        }
    }, [inviteCode]);

    const validateAndJoin = async () => {
        if (!inviteCode) return;

        try {
            const result = await partyService.validateInviteCode(inviteCode);

            if (result.valid) {
                const joinResult = await partyService.joinByInviteCode(inviteCode);

                if (joinResult.success) {
                    navigate(joinResult.redirectTo || `/watch/${joinResult.partyId}`);
                } else {
                    setError('Failed to join the party');
                    setIsValidating(false);
                }
            } else {
                setError(result.error || 'Invalid or expired invite code');
                setIsValidating(false);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to join watch party');
            setIsValidating(false);
        }
    };

    if (isValidating) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: '#0b0c10',
                    color: 'white',
                    fontFamily: 'Arial, sans-serif',
                }}
            >
                <div
                    style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #00c8ff',
                        borderTop: '4px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                    }}
                ></div>
                <h2 style={{ marginTop: '20px' }}>Joining Watch Party...</h2>
                <p style={{ color: '#a7a9ac' }}>Please wait while we connect you to the party.</p>

                <style>
                    {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
                </style>
            </div>
        );
    }

    if (error) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    backgroundColor: '#0b0c10',
                    color: 'white',
                    fontFamily: 'Arial, sans-serif',
                    padding: '2rem',
                }}
            >
                <div style={{ textAlign: 'center', maxWidth: '500px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
                    <h2>Unable to Join Watch Party</h2>
                    <p style={{ color: '#a7a9ac', marginBottom: '30px' }}>{error}</p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#1c1d24',
                                color: '#00c8ff',
                                border: '1px solid #00c8ff',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '16px',
                            }}
                        >
                            Go Home
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#00c8ff',
                                color: '#0b0c10',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '600',
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default JoinByCodePage;
