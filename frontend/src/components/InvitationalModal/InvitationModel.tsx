import { useState, useRef } from 'react';
import { partyService, SendInvitationRequest } from '../../services/partyService';
import './InvitationModal.css';

interface InvitationModalProps {
    partyId: string;
    partyName: string;
    inviteCode: string;
    inviteLink: string;
    isOpen: boolean;
    onClose: () => void;
}

const InvitationModal: React.FC<InvitationModalProps> = ({
    partyId,
    partyName,
    inviteCode,
    inviteLink,
    isOpen,
    onClose,
}) => {
    const [activeTab, setActiveTab] = useState<'link' | 'users' | 'email'>('link');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // User invitation state
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // Email invitation state
    const [emailList, setEmailList] = useState<string[]>(['']);

    const linkInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            setSuccess('Invite link copied to clipboard!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Failed to copy link:', error);
            // Fallback for older browsers
            if (linkInputRef.current) {
                linkInputRef.current.select();
                document.execCommand('copy');
                setSuccess('Invite link copied to clipboard!');
                setTimeout(() => setSuccess(null), 3000);
            }
        }
    };

    const handleSendUserInvitations = async () => {
        if (selectedUsers.length === 0) {
            setError('Please select at least one user to invite');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const invitationData: SendInvitationRequest = {
                recipientIds: selectedUsers,
                message: message.trim() || undefined,
            };

            const result = await partyService.sendInvitations(partyId, invitationData);
            setSuccess(`${result.invitations} invitation(s) sent successfully!`);
            setSelectedUsers([]);
            setMessage('');
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Failed to send invitations:', error);
            setError(error instanceof Error ? error.message : 'Failed to send invitations');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendEmailInvitations = async () => {
        const validEmails = emailList.filter(email =>
            email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        );

        if (validEmails.length === 0) {
            setError('Please enter at least one valid email address');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const invitationData: SendInvitationRequest = {
                recipientEmails: validEmails,
                message: message.trim() || undefined,
            };

            const result = await partyService.sendInvitations(partyId, invitationData);
            setSuccess(`${result.invitations} invitation(s) sent successfully!`);
            setEmailList(['']);
            setMessage('');
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Failed to send email invitations:', error);
            setError(error instanceof Error ? error.message : 'Failed to send invitations');
        } finally {
            setIsLoading(false);
        }
    };

    const addEmailField = () => {
        setEmailList([...emailList, '']);
    };

    const removeEmailField = (index: number) => {
        if (emailList.length > 1) {
            setEmailList(emailList.filter((_, i) => i !== index));
        }
    };

    const updateEmail = (index: number, value: string) => {
        const newEmailList = [...emailList];
        newEmailList[index] = value;
        setEmailList(newEmailList);
    };

    const handleClose = () => {
        setError(null);
        setSuccess(null);
        setMessage('');
        setSelectedUsers([]);
        setEmailList(['']);
        setUserSearchQuery('');
        onClose();
    };

    return (
        <div className="invitation-modal-overlay" onClick={handleClose}>
            <div className="invitation-modal" onClick={(e) => e.stopPropagation()}>
                <div className="invitation-modal-header">
                    <h3>Invite Friends to "{partyName}"</h3>
                    <button className="close-btn" onClick={handleClose}>×</button>
                </div>

                <div className="invitation-modal-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'link' ? 'active' : ''}`}
                        onClick={() => setActiveTab('link')}
                    >
                        Share Link
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Invite Users
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'email' ? 'active' : ''}`}
                        onClick={() => setActiveTab('email')}
                    >
                        Email Invites
                    </button>
                </div>

                <div className="invitation-modal-content">
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    {activeTab === 'link' && (
                        <div className="share-link-section">
                            <p>Share this link with your friends:</p>
                            <div className="invite-link-container">
                                <input
                                    ref={linkInputRef}
                                    type="text"
                                    value={inviteLink}
                                    readOnly
                                    className="invite-link-input"
                                />
                                <button className="copy-btn" onClick={handleCopyLink}>
                                    Copy Link
                                </button>
                            </div>
                            <div className="invite-code-section">
                                <p>Or share the invite code: <strong>{inviteCode}</strong></p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="invite-users-section">
                            <div className="user-search">
                                <input
                                    type="text"
                                    placeholder="Search for users..."
                                    value={userSearchQuery}
                                    onChange={(e) => setUserSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                            </div>

                            {selectedUsers.length > 0 && (
                                <div className="selected-users">
                                    <h4>Selected Users ({selectedUsers.length})</h4>
                                    <div className="selected-users-list">
                                        {selectedUsers.map((userId) => (
                                            <div key={userId} className="selected-user-item">
                                                <img
                                                    src={`https://i.pravatar.cc/150?u=${userId}`}
                                                    alt="User"
                                                    className="user-avatar"
                                                />
                                                <span>User {userId}</span>
                                                <button
                                                    onClick={() => setSelectedUsers(selectedUsers.filter(id => id !== userId))}
                                                    className="remove-user-btn"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="message-section">
                                <label htmlFor="invitation-message">Custom Message (Optional)</label>
                                <textarea
                                    id="invitation-message"
                                    placeholder="Add a personal message to your invitation..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    maxLength={500}
                                    rows={3}
                                />
                                <small>{message.length}/500 characters</small>
                            </div>

                            <button
                                className="send-invites-btn"
                                onClick={handleSendUserInvitations}
                                disabled={isLoading || selectedUsers.length === 0}
                            >
                                {isLoading ? 'Sending...' : `Send Invitations (${selectedUsers.length})`}
                            </button>
                        </div>
                    )}

                    {activeTab === 'email' && (
                        <div className="email-invites-section">
                            <h4>Send Email Invitations</h4>

                            <div className="email-inputs">
                                {emailList.map((email, index) => (
                                    <div key={index} className="email-input-row">
                                        <input
                                            type="email"
                                            placeholder="Enter email address"
                                            value={email}
                                            onChange={(e) => updateEmail(index, e.target.value)}
                                            className="email-input"
                                        />
                                        {emailList.length > 1 && (
                                            <button
                                                onClick={() => removeEmailField(index)}
                                                className="remove-email-btn"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button onClick={addEmailField} className="add-email-btn">
                                    + Add Another Email
                                </button>
                            </div>

                            <div className="message-section">
                                <label htmlFor="email-message">Custom Message (Optional)</label>
                                <textarea
                                    id="email-message"
                                    placeholder="Add a personal message to your invitation..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    maxLength={500}
                                    rows={3}
                                />
                                <small>{message.length}/500 characters</small>
                            </div>

                            <button
                                className="send-invites-btn"
                                onClick={handleSendEmailInvitations}
                                disabled={isLoading || emailList.every(email => !email.trim())}
                            >
                                {isLoading ? 'Sending...' : 'Send Email Invitations'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvitationModal;