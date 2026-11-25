import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { AuditLogEntry } from '../types';

interface AuditLogTableProps {
  logs: AuditLogEntry[];
  onRefresh?: () => void;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs, onRefresh }) => {
  const [filter, setFilter] = useState<'ALL' | 'ALLOWED' | 'DENIED'>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALL') return true;
    return log.status === filter;
  });

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' ' +
        date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Security & Authentication Audit Trail</Text>
          <Text style={styles.subtitle}>
            Live verification log of allowed and blocked domain login attempts
          </Text>
        </View>

        <View style={styles.actions}>
          <View style={styles.filterGroup}>
            {(['ALL', 'ALLOWED', 'DENIED'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setFilter(mode)}
                style={[styles.filterBtn, filter === mode && styles.filterBtnActive]}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === mode && styles.filterTextActive,
                  ]}
                >
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {onRefresh && (
            <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
              <Feather name="refresh-cw" size={14} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: 160 }]}>TIMESTAMP</Text>
            <Text style={[styles.th, { width: 110 }]}>RESULT</Text>
            <Text style={[styles.th, { width: 220 }]}>EMAIL ATTEMPTED</Text>
            <Text style={[styles.th, { width: 130 }]}>DOMAIN</Text>
            <Text style={[styles.th, { width: 260 }]}>SECURITY POLICY VERDICT</Text>
            <Text style={[styles.th, { width: 90 }]}>PLATFORM</Text>
          </View>

          {/* Table Rows */}
          {filteredLogs.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No audit records matching filter.</Text>
            </View>
          ) : (
            filteredLogs.map((log) => {
              const isAllowed = log.status === 'ALLOWED';
              return (
                <View key={log.id} style={styles.tableRow}>
                  {/* Timestamp */}
                  <View style={[styles.td, { width: 160 }]}>
                    <Text style={styles.timestampText}>{formatTime(log.timestamp)}</Text>
                  </View>

                  {/* Result Badge */}
                  <View style={[styles.td, { width: 110 }]}>
                    <View
                      style={[
                        styles.statusBadge,
                        isAllowed ? styles.allowedBadge : styles.deniedBadge,
                      ]}
                    >
                      <MaterialIcons
                        name={isAllowed ? 'check-circle' : 'block'}
                        size={12}
                        color={isAllowed ? '#059669' : '#DC2626'}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          isAllowed ? styles.allowedText : styles.deniedText,
                        ]}
                      >
                        {log.status}
                      </Text>
                    </View>
                  </View>

                  {/* Email */}
                  <View style={[styles.td, { width: 220 }]}>
                    <Text style={styles.emailText} numberOfLines={1}>
                      {log.email}
                    </Text>
                  </View>

                  {/* Domain */}
                  <View style={[styles.td, { width: 130 }]}>
                    <View style={styles.domainTag}>
                      <Text style={styles.domainTagText} numberOfLines={1}>
                        @{log.domain}
                      </Text>
                    </View>
                  </View>

                  {/* Policy Verdict */}
                  <View style={[styles.td, { width: 260 }]}>
                    <Text style={styles.reasonText} numberOfLines={2}>
                      {log.reason}
                    </Text>
                  </View>

                  {/* Platform */}
                  <View style={[styles.td, { width: 90 }]}>
                    <Text style={styles.platformText}>
                      {log.platform?.toUpperCase() || 'UNKNOWN'}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
      default: {
        elevation: 1,
      },
    }),
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  filterBtnActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#0F172A',
  },
  refreshBtn: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  table: {
    minWidth: 970,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  th: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  td: {
    justifyContent: 'center',
  },
  timestampText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  allowedBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  deniedBadge: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  allowedText: {
    color: '#059669',
  },
  deniedText: {
    color: '#DC2626',
  },
  emailText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  domainTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  domainTagText: {
    fontSize: 11,
    color: '#475569',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  reasonText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
  },
  platformText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyRow: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
  },
});
