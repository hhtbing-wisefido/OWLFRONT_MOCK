#!/usr/bin/env python3
"""
Generate permission table from SQL file and compare with given matrix
"""

import re
from collections import defaultdict

# Resource type mapping (SQL -> Matrix)
RESOURCE_MAPPING = {
    'cards': 'cards(vital-monitor)',
    'roles': 'roles',
    'users': 'users',
    'residents': 'resident',
    'resident_phi': 'resident_phi',
    'resident_contacts': 'resident_contacts',
    'resident_caregivers': 'resident_caregivers',
    'alarm_cloud': 'cloud_alarm_polices',
    'alarm_device': 'Iot_Monitor_alarm',
    'tags_catalog': 'tags_catalog',
    'service_levels': 'service_level',
    'alarm_events': 'alarm_event',
    'rounds': 'rounds',
    'round_details': 'round_details',
    'units': 'units',
    'rooms': 'rooms',
    'beds': 'beds',
    'devices': 'device',
    'config_versions': 'config_versions',
    'iot_timeseries': 'iot_timeseries',
    'tenants': 'tenants',
    'role_permissions': 'role-permissions',
    'device_store': 'device-store',
}

def parse_sql_permissions(sql_file):
    """Parse permissions from SQL file and convert to matrix format"""
    permissions = defaultdict(lambda: defaultdict(lambda: {'ops': set(), 'scopes': set()}))
    
    with open(sql_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Match INSERT statements
    pattern = r"\(NULL, '(\w+)', '(\w+)', '(\w+)', '(\w+)'\)"
    matches = re.findall(pattern, content)
    
    for role, resource, perm_type, scope in matches:
        if role in ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family']:
            # Map resource type
            matrix_resource = RESOURCE_MAPPING.get(resource, resource)
            
            # Handle manage permission
            if perm_type == 'manage':
                permissions[role][matrix_resource]['ops'].update(['R', 'C', 'D', 'U'])
                permissions[role][matrix_resource]['scopes'].add(scope)
            else:
                # Map permission type to letter
                perm_letter = {
                    'read': 'R',
                    'create': 'C',
                    'update': 'U',
                    'delete': 'D'
                }.get(perm_type, perm_type)
                permissions[role][matrix_resource]['ops'].add(perm_letter)
                permissions[role][matrix_resource]['scopes'].add(scope)
    
    # Convert to matrix format
    result = {}
    for role, resources in permissions.items():
        result[role] = {}
        for resource, data in resources.items():
            ops = sorted(list(data['ops']))
            scopes = sorted(list(data['scopes']))
            
            # Build permission string
            if not ops:
                result[role][resource] = '-'
            else:
                # Check if all permissions have same scope
                if len(scopes) == 1:
                    scope = scopes[0]
                    if scope == 'all':
                        # No scope indicator needed
                        perm_str = ''.join(ops)
                    else:
                        # Add scope indicator (A for assigned_only, self_only, linked_residents_only)
                        perm_str = ''.join(ops) + 'A'
                else:
                    # Multiple scopes - need to group by scope
                    # This is complex, let's simplify for now
                    if 'all' in scopes and len([s for s in scopes if s != 'all']) > 0:
                        # Mixed scopes - show as combined
                        perm_str = ''.join(ops)
                        if any(s != 'all' for s in scopes):
                            perm_str += 'A'
                    else:
                        # All scopes are non-all
                        perm_str = ''.join(ops) + 'A'
                
                # Handle special cases like RA/UA (read+assigned and update+assigned)
                if 'R' in ops and 'U' in ops and 'all' not in scopes:
                    # Check if we have separate read and update with assigned
                    if len([s for s in scopes if s != 'all']) > 0:
                        # This should be RA/UA format
                        result[role][resource] = 'RA/UA'
                    else:
                        result[role][resource] = perm_str
                elif 'R' in ops and 'C' in ops and 'U' in ops and 'all' not in scopes:
                    # RCU with assigned scope
                    result[role][resource] = 'RCUA' if 'all' not in scopes else 'RCU'
                else:
                    result[role][resource] = perm_str
    
    return result

def generate_table(permissions_from_sql, matrix_table):
    """Generate comparison table"""
    roles = ['SystemAdmin', 'Admin', 'Manager', 'IT', 'Nurse', 'Caregiver', 'Resident', 'Family']
    resources = [
        'cards(vital-monitor)', 'roles', 'users', 'resident', 'resident_phi', 'resident_contacts',
        'resident_caregivers', 'cloud_alarm_polices', 'Iot_Monitor_alarm', 'tags_catalog',
        'service_level', 'alarm_event', 'rounds', 'round_details', 'units', 'rooms', 'beds',
        'device', 'config_versions', 'iot_timeseries', 'tenants', 'role-permissions', 'device-store'
    ]
    
    print("## Permission Comparison: SQL vs Matrix Table\n")
    print("| Resource | SystemAdmin | Admin | Manager | IT | Nurse | Caregiver | Resident | Family |")
    print("|----------|-------------|-------|---------|-----|-------|-----------|----------|--------|")
    
    differences = []
    
    for resource in resources:
        row = [resource]
        for role in roles:
            sql_perm = permissions_from_sql.get(role, {}).get(resource, '-')
            matrix_perm = matrix_table.get(role, {}).get(resource, '-')
            
            # Normalize for comparison
            sql_normalized = normalize_permission(sql_perm)
            matrix_normalized = normalize_permission(matrix_perm)
            
            if sql_normalized == matrix_normalized:
                row.append(sql_perm)
            else:
                row.append(f"**{sql_perm}** ❌ (Matrix: {matrix_perm})")
                differences.append(f"{role} - {resource}: SQL={sql_perm}, Matrix={matrix_perm}")
        
        print("| " + " | ".join(row) + " |")
    
    print("\n## Differences Found:\n")
    if differences:
        for diff in differences:
            print(f"- {diff}")
    else:
        print("✅ No differences found!")

def normalize_permission(perm):
    """Normalize permission string for comparison"""
    if perm == '-' or not perm:
        return '-'
    # Remove (homecare) annotations
    perm = perm.replace('(homecare)', '').strip()
    # Sort letters in permission codes
    if '/' in perm:
        parts = perm.split('/')
        return '/'.join(sorted(parts))
    return ''.join(sorted(perm))

# Given matrix table
matrix_table = {
    'SystemAdmin': {
        'cards(vital-monitor)': '-', 'roles': 'RCDU', 'users': '-', 'resident': '-',
        'resident_phi': '-', 'resident_contacts': '-', 'resident_caregivers': '-',
        'cloud_alarm_polices': '-', 'Iot_Monitor_alarm': '-', 'tags_catalog': 'RCDU',
        'service_level': '-', 'alarm_event': '-', 'rounds': '-', 'round_details': '-',
        'units': '-', 'rooms': '-', 'beds': '-', 'device': '-', 'config_versions': '-',
        'iot_timeseries': '-', 'tenants': 'RCDU', 'role-permissions': 'RCDU', 'device-store': 'RCDU'
    },
    'Admin': {
        'cards(vital-monitor)': 'RCDU', 'roles': 'RU', 'users': 'RCDU', 'resident': 'RCDU',
        'resident_phi': 'RCDU', 'resident_contacts': 'RCDU', 'resident_caregivers': 'RCDU',
        'cloud_alarm_polices': 'RCDU', 'Iot_Monitor_alarm': 'RCDU', 'tags_catalog': 'RCDU',
        'service_level': 'RCDU', 'alarm_event': 'RCDU', 'rounds': 'RCDU', 'round_details': 'RCDU',
        'units': 'RCDU', 'rooms': 'RCDU', 'beds': 'RCDU', 'device': 'RCDU', 'config_versions': 'RCDU',
        'iot_timeseries': 'RCDU', 'tenants': '-', 'role-permissions': 'R', 'device-store': 'RA'
    },
    'Manager': {
        'cards(vital-monitor)': 'R', 'roles': 'RU', 'users': 'RCDU', 'resident': 'RCDU',
        'resident_phi': 'RCDU', 'resident_contacts': 'RCDU', 'resident_caregivers': 'RCDU',
        'cloud_alarm_polices': 'RCDU', 'Iot_Monitor_alarm': 'RCDU', 'tags_catalog': 'RCDU',
        'service_level': 'RCDU', 'alarm_event': 'RCDU', 'rounds': 'RCDU', 'round_details': 'RCDU',
        'units': 'RCDU', 'rooms': 'RCDU', 'beds': 'RCDU', 'device': 'RCDU', 'config_versions': '-',
        'iot_timeseries': 'R', 'tenants': '-', 'role-permissions': 'R', 'device-store': 'RA'
    },
    'IT': {
        'cards(vital-monitor)': '-', 'roles': 'read', 'users': 'RCDU', 'resident': 'read',
        'resident_phi': '-', 'resident_contacts': '-', 'resident_caregivers': 'read',
        'cloud_alarm_polices': '-', 'Iot_Monitor_alarm': 'RCDU', 'tags_catalog': 'RCDU',
        'service_level': '-', 'alarm_event': 'R', 'rounds': '-', 'round_details': '-',
        'units': 'RCDU', 'rooms': 'RCDU', 'beds': 'RCDU', 'device': 'RCDU', 'config_versions': 'RCDU',
        'iot_timeseries': '-', 'tenants': '-', 'role-permissions': 'R', 'device-store': 'RA'
    },
    'Nurse': {
        'cards(vital-monitor)': 'R', 'roles': '-', 'users': '-', 'resident': 'RA/UA',
        'resident_phi': 'RA', 'resident_contacts': 'RA/UA', 'resident_caregivers': 'R',
        'cloud_alarm_polices': 'R', 'Iot_Monitor_alarm': 'R/CA/UA', 'tags_catalog': 'R',
        'service_level': 'R', 'alarm_event': 'RU', 'rounds': 'RCU', 'round_details': 'RCU',
        'units': 'R', 'rooms': 'R', 'beds': 'R', 'device': 'R', 'config_versions': '-',
        'iot_timeseries': '-', 'tenants': '-', 'role-permissions': '-', 'device-store': '-'
    },
    'Caregiver': {
        'cards(vital-monitor)': 'RA', 'roles': '-', 'users': '-', 'resident': 'RA',
        'resident_phi': 'RA', 'resident_contacts': 'RA', 'resident_caregivers': 'R',
        'cloud_alarm_polices': 'R', 'Iot_Monitor_alarm': 'RA', 'tags_catalog': 'R',
        'service_level': 'R', 'alarm_event': 'RU', 'rounds': 'RCU', 'round_details': 'RCU',
        'units': 'R', 'rooms': 'R', 'beds': 'R', 'device': 'R', 'config_versions': '-',
        'iot_timeseries': '-', 'tenants': '-', 'role-permissions': '-', 'device-store': '-'
    },
    'Resident': {
        'cards(vital-monitor)': 'RA', 'roles': '-', 'users': '-', 'resident': '-',
        'resident_phi': '-', 'resident_contacts': 'RUA', 'resident_caregivers': '-',
        'cloud_alarm_polices': '-', 'Iot_Monitor_alarm': '-', 'tags_catalog': '-',
        'service_level': '-', 'alarm_event': 'RA/RUA(homecare)', 'rounds': '-', 'round_details': '-',
        'units': '-', 'rooms': '-', 'beds': '-', 'device': '-', 'config_versions': '-',
        'iot_timeseries': '-', 'tenants': '-', 'role-permissions': '-', 'device-store': '-'
    },
    'Family': {
        'cards(vital-monitor)': 'RA', 'roles': '-', 'users': '-', 'resident': '-',
        'resident_phi': '-', 'resident_contacts': 'RUA', 'resident_caregivers': '-',
        'cloud_alarm_polices': '-', 'Iot_Monitor_alarm': '-', 'tags_catalog': '-',
        'service_level': '-', 'alarm_event': 'RA/RUA(homecare)', 'rounds': '-', 'round_details': '-',
        'units': '-', 'rooms': '-', 'beds': '-', 'device': '-', 'config_versions': '-',
        'iot_timeseries': '-', 'tenants': '-', 'role-permissions': '-', 'device-store': '-'
    }
}

if __name__ == '__main__':
    sql_file = '/Users/sady3721/project/owlRD/db/03_role_permissions.sql'
    permissions_from_sql = parse_sql_permissions(sql_file)
    generate_table(permissions_from_sql, matrix_table)
