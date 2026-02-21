import { useState, useEffect } from 'react';
import { Shield, Ban, Clock, X } from 'lucide-react';
import { supabase, Profile, UserBan } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function UserManagement() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banDays, setBanDays] = useState(7);
  const [banReason, setBanReason] = useState('');
  const [newRole, setNewRole] = useState<Profile['role']>('reader');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setUsers(data);
    }
  };

  const canManageUser = (targetUser: Profile): boolean => {
    if (!profile) return false;

    if (profile.role === 'super_admin') return true;

    if (profile.role === 'admin') {
      return !['super_admin', 'admin'].includes(targetUser.role);
    }

    if (profile.role === 'moderator') {
      return ['writer', 'reader'].includes(targetUser.role);
    }

    return false;
  };

  const canAssignRole = (role: Profile['role']): boolean => {
    if (!profile) return false;

    if (profile.role === 'super_admin') return true;
    if (profile.role === 'admin') return !['super_admin'].includes(role);
    if (profile.role === 'moderator') return role === 'writer';

    return false;
  };

  const handleRoleChange = async (user: Profile) => {
    if (!canManageUser(user) || !canAssignRole(newRole) || loading) return;

    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id);

    if (!error) {
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'role_change',
        title: 'Rolünüz Değiştirildi',
        message: `Yeni rolünüz: ${newRole}`,
      });

      await loadUsers();
      setSelectedUser(null);
    }

    setLoading(false);
  };

  const handleBanUser = async () => {
    if (!selectedUser || !canManageUser(selectedUser) || !banReason.trim() || loading) return;

    setLoading(true);

    const bannedUntil = new Date();
    bannedUntil.setDate(bannedUntil.getDate() + banDays);

    const { error } = await supabase.from('user_bans').insert({
      user_id: selectedUser.id,
      banned_by: profile!.id,
      reason: banReason.trim(),
      banned_until: bannedUntil.toISOString(),
    });

    if (!error) {
      await loadUsers();
      setShowBanModal(false);
      setSelectedUser(null);
      setBanReason('');
      setBanDays(7);
    }

    setLoading(false);
  };

  const handleUnban = async (user: Profile) => {
    if (!canManageUser(user) || loading) return;

    setLoading(true);

    await supabase.from('user_bans').delete().eq('user_id', user.id);

    await supabase
      .from('profiles')
      .update({ banned_until: null })
      .eq('id', user.id);

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'unban',
      title: 'Yasağınız Kaldırıldı',
      message: 'Hesabınız tekrar aktif edildi.',
    });

    await loadUsers();
    setLoading(false);
  };

  const isBanned = (user: Profile): boolean => {
    return user.banned_until ? new Date(user.banned_until) > new Date() : false;
  };

  const getRoleColor = (role: Profile['role']): string => {
    const colors = {
      super_admin: 'text-purple-400 bg-purple-900/30 border-purple-900',
      admin: 'text-red-400 bg-red-900/30 border-red-900',
      moderator: 'text-orange-400 bg-orange-900/30 border-orange-900',
      writer: 'text-blue-400 bg-blue-900/30 border-blue-900',
      reader: 'text-zinc-400 bg-zinc-900/30 border-zinc-800',
      banned: 'text-red-400 bg-red-900/50 border-red-900',
    };
    return colors[role] || colors.reader;
  };

  const getRoleLabel = (role: Profile['role']): string => {
    const labels = {
      super_admin: 'Süper Admin',
      admin: 'Admin',
      moderator: 'Moderatör',
      writer: 'Yazar',
      reader: 'Okuyucu',
      banned: 'Yasaklı',
    };
    return labels[role] || role;
  };

  if (!profile || !['super_admin', 'admin', 'moderator'].includes(profile.role)) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Kullanıcı Yönetimi</h2>

      <div className="grid gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {user.display_name}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                      user.role
                    )}`}
                  >
                    {getRoleLabel(user.role)}
                  </span>
                  {isBanned(user) && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium border text-red-400 bg-red-900/30 border-red-900">
                      <Ban className="w-3 h-3 inline mr-1" />
                      Yasaklı
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-400">{user.email}</p>
                {isBanned(user) && (
                  <p className="text-xs text-red-400 mt-1">
                    Yasak bitiş: {new Date(user.banned_until!).toLocaleDateString('tr-TR')}
                  </p>
                )}
              </div>

              {canManageUser(user) && user.id !== profile.id && (
                <div className="flex gap-2">
                  {!isBanned(user) && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setNewRole(user.role);
                        }}
                        className="px-3 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition-colors text-sm"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowBanModal(true);
                        }}
                        className="px-3 py-2 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 transition-colors text-sm"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {isBanned(user) && (
                    <button
                      onClick={() => handleUnban(user)}
                      disabled={loading}
                      className="px-3 py-2 bg-green-900/30 text-green-400 rounded hover:bg-green-900/50 transition-colors text-sm disabled:opacity-50"
                    >
                      Yasağı Kaldır
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedUser && !showBanModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Rol Değiştir</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-zinc-400 mb-4">
              Kullanıcı: <span className="text-white">{selectedUser.display_name}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Yeni Rol
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Profile['role'])}
                  className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-500"
                >
                  {canAssignRole('reader') && <option value="reader">Okuyucu</option>}
                  {canAssignRole('writer') && <option value="writer">Yazar</option>}
                  {canAssignRole('moderator') && <option value="moderator">Moderatör</option>}
                  {canAssignRole('admin') && <option value="admin">Admin</option>}
                  {canAssignRole('super_admin') && <option value="super_admin">Süper Admin</option>}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleRoleChange(selectedUser)}
                  disabled={loading || newRole === selectedUser.role}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Kaydet
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Kullanıcıyı Yasakla</h3>
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setSelectedUser(null);
                }}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-zinc-400 mb-4">
              Kullanıcı: <span className="text-white">{selectedUser.display_name}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Yasak Süresi (Gün)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={banDays}
                  onChange={(e) => setBanDays(parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Sebep
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
                  rows={3}
                  placeholder="Yasak sebebini yazın..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleBanUser}
                  disabled={loading || !banReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Yasakla
                </button>
                <button
                  onClick={() => {
                    setShowBanModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
