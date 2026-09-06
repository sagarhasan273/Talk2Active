import React, { useMemo, useState, useCallback } from 'react';

import {
  Clear as ClearIcon,
  Search as SearchIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Language as LanguageIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import {
  Box,
  Grid,
  Chip,
  Paper,
  Stack,
  alpha,
  Select,
  Switch,
  Button,
  MenuItem,
  useTheme,
  TextField,
  Typography,
  IconButton,
  FormControl,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

export interface VoiceRoomsFilterProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

export interface FilterState {
  searchQuery: string;
  selectedLanguage: string;
  selectedLevel: string;
  hideFullRooms: boolean;
  showActiveOnly: boolean;
}

const LANGUAGE_OPTIONS = [
  { value: 'all', label: 'All Languages', emoji: '🌐' },
  { value: 'English', label: 'English', emoji: '🇬🇧' },
  { value: 'Spanish', label: 'Spanish', emoji: '🇪🇸' },
  { value: 'French', label: 'French', emoji: '🇫🇷' },
  { value: 'German', label: 'German', emoji: '🇩🇪' },
  { value: 'Italian', label: 'Italian', emoji: '🇮🇹' },
  { value: 'Portuguese', label: 'Portuguese', emoji: '🇵🇹' },
  { value: 'Russian', label: 'Russian', emoji: '🇷🇺' },
  { value: 'Japanese', label: 'Japanese', emoji: '🇯🇵' },
  { value: 'Korean', label: 'Korean', emoji: '🇰🇷' },
  { value: 'Chinese', label: 'Chinese', emoji: '🇨🇳' },
  { value: 'Arabic', label: 'Arabic', emoji: '🇸🇦' },
];

const LEVEL_OPTIONS = [
  { value: 'all', label: 'All Levels', emoji: '🎯' },
  { value: 'Beginner', label: 'A1-A2 Beginner', emoji: '🌱' },
  { value: 'Intermediate', label: 'B1-B2 Intermediate', emoji: '📈' },
  { value: 'Advanced', label: 'C1-C2 Advanced', emoji: '🏆' },
  { value: 'IELTS', label: 'IELTS / Exam Prep', emoji: '📝' },
  { value: 'Business', label: 'Business English', emoji: '💼' },
  { value: 'Conversation', label: 'Conversation Practice', emoji: '🗣️' },
];

export const VoiceRoomsFilter: React.FC<VoiceRoomsFilterProps> = ({
  onFilterChange,
  initialFilters = {},
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery || '');
  const [selectedLanguage, setSelectedLanguage] = useState(
    initialFilters.selectedLanguage || 'all'
  );
  const [selectedLevel, setSelectedLevel] = useState(initialFilters.selectedLevel || 'all');
  const [hideFullRooms, setHideFullRooms] = useState(initialFilters.hideFullRooms || false);
  const [showActiveOnly, setShowActiveOnly] = useState(initialFilters.showActiveOnly || false);
  const [isExpanded, setIsExpanded] = useState(false);


  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedLanguage !== 'all') count += 1;
    if (selectedLevel !== 'all') count += 1;
    if (hideFullRooms) count += 1;
    if (showActiveOnly) count += 1;
    return count;
  }, [selectedLanguage, selectedLevel, hideFullRooms, showActiveOnly]);


  // Debounce search input
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setSearchQuery(value);
      // Use setTimeout for debouncing
      const timeoutId = setTimeout(() => {
        onFilterChange({
          searchQuery: value,
          selectedLanguage,
          selectedLevel,
          hideFullRooms,
          showActiveOnly,
        });
      }, 300);
      return () => clearTimeout(timeoutId);
    },
    [selectedLanguage, selectedLevel, hideFullRooms, showActiveOnly, onFilterChange]
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedLanguage('all');
    setSelectedLevel('all');
    setHideFullRooms(false);
    setShowActiveOnly(false);
    onFilterChange({
      searchQuery: '',
      selectedLanguage: 'all',
      selectedLevel: 'all',
      hideFullRooms: false,
      showActiveOnly: false,
    });
  }, [onFilterChange]);

  // Handle filter updates with immediate callback
  const handleFilterUpdate = useCallback(
    (updates: Partial<FilterState>) => {
      const newFilters = {
        searchQuery,
        selectedLanguage,
        selectedLevel,
        hideFullRooms,
        showActiveOnly,
        ...updates,
      };

      if (updates.searchQuery !== undefined) setSearchQuery(updates.searchQuery);
      if (updates.selectedLanguage !== undefined) setSelectedLanguage(updates.selectedLanguage);
      if (updates.selectedLevel !== undefined) setSelectedLevel(updates.selectedLevel);
      if (updates.hideFullRooms !== undefined) setHideFullRooms(updates.hideFullRooms);
      if (updates.showActiveOnly !== undefined) setShowActiveOnly(updates.showActiveOnly);

      onFilterChange(newFilters);
    },
    [searchQuery, selectedLanguage, selectedLevel, hideFullRooms, showActiveOnly, onFilterChange]
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1, sm: 2 },
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.05)}`,
        },
      }}
    >
      {/* Search Bar - Always Visible */}
      <Grid container spacing={2} alignItems="center">
        {/* Search Field */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search title, topic, or host..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => handleFilterUpdate({ searchQuery: '' })}
                    sx={{ p: 0.5 }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                '&:hover': {
                  bgcolor: alpha(theme.palette.background.default, 0.8),
                },
              },
            }}
          />
        </Grid>

        {/* Quick Filters - Desktop */}
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <FormControl fullWidth size="small">
            <Select
              value={selectedLanguage}
              onChange={(e) => handleFilterUpdate({ selectedLanguage: e.target.value })}
              displayEmpty
              renderValue={(selected) => {
                if (!selected || selected === 'all') {
                  return (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LanguageIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Language
                      </Typography>
                    </Stack>
                  );
                }
                const option = LANGUAGE_OPTIONS.find((opt) => opt.value === selected);
                return option ? `${option.emoji} ${option.label}` : selected;
              }}
              sx={{
                borderRadius: 1,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                '&:hover': {
                  bgcolor: alpha(theme.palette.background.default, 0.8),
                },
                '& .MuiSelect-select': {
                  py: 1.2,
                },
              }}
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.emoji} {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <FormControl fullWidth size="small">
            <Select
              value={selectedLevel}
              onChange={(e) => handleFilterUpdate({ selectedLevel: e.target.value })}
              displayEmpty
              renderValue={(selected) => {
                if (!selected || selected === 'all') {
                  return (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <SchoolIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Level
                      </Typography>
                    </Stack>
                  );
                }
                const option = LEVEL_OPTIONS.find((opt) => opt.value === selected);
                return option ? `${option.emoji} ${option.label}` : selected;
              }}
              sx={{
                borderRadius: 1,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                '&:hover': {
                  bgcolor: alpha(theme.palette.background.default, 0.8),
                },
                '& .MuiSelect-select': {
                  py: 1.2,
                },
              }}
            >
              {LEVEL_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.emoji} {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Filter Controls */}
        <Grid
          size={{ xs: 12, sm: 6, md: 3 }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
            gap: 1,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={hideFullRooms}
                  onChange={(e) => handleFilterUpdate({ hideFullRooms: e.target.checked })}
                  size="small"
                  color="primary"
                />
              }
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <PeopleIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Hide full
                  </Typography>
                </Stack>
              }
            />

            <IconButton
              onClick={() => setIsExpanded(!isExpanded)}
              size="small"
              sx={{
                bgcolor:
                  activeFilterCount > 0 ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                color: activeFilterCount > 0 ? 'primary.main' : 'action.active',
                border: `1px solid ${activeFilterCount > 0 ? theme.palette.primary.main : alpha(theme.palette.divider, 0.1)}`,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                },
              }}
            >
              <FilterListIcon fontSize="small" />
              {activeFilterCount > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontSize: 9,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {activeFilterCount}
                </Box>
              )}
            </IconButton>
          </Stack>
        </Grid>
      </Grid>

      {/* Expanded Filters - Advanced Options */}
      {isExpanded && (
        <Box
          sx={{
            pt: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            animation: 'fadeIn 0.3s ease',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(-10px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Grid container spacing={2} alignItems="center">
            {/* Active Only Toggle */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showActiveOnly}
                    onChange={(e) => handleFilterUpdate({ showActiveOnly: e.target.checked })}
                    color="success"
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={500}>
                    🔴 Active rooms only
                  </Typography>
                }
              />
            </Grid>

            {/* Quick Chips */}
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mr: 1, alignSelf: 'center' }}
                >
                  Quick filters:
                </Typography>
                {LANGUAGE_OPTIONS.slice(0, 4).map((lang) => (
                  <Chip
                    key={lang.value}
                    label={`${lang.emoji} ${lang.label}`}
                    size="small"
                    variant={selectedLanguage === lang.value ? 'filled' : 'outlined'}
                    color={selectedLanguage === lang.value ? 'primary' : 'default'}
                    onClick={() => handleFilterUpdate({ selectedLanguage: lang.value })}
                    sx={{
                      borderRadius: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </Stack>
            </Grid>

            {/* Clear Filters */}
            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              sx={{
                display: 'flex',
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
              }}
            >
              <Button
                size="small"
                variant="text"
                color="error"
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.error.main, 0.05),
                  },
                }}
              >
                Clear all filters
              </Button>
            </Grid>
          </Grid>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              sx={{
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mr: 1, alignSelf: 'center' }}
              >
                Active filters:
              </Typography>
              {selectedLanguage !== 'all' && (
                <Chip
                  label={`Language: ${selectedLanguage}`}
                  size="small"
                  onDelete={() => handleFilterUpdate({ selectedLanguage: 'all' })}
                  color="primary"
                  variant="outlined"
                />
              )}
              {selectedLevel !== 'all' && (
                <Chip
                  label={`Level: ${selectedLevel}`}
                  size="small"
                  onDelete={() => handleFilterUpdate({ selectedLevel: 'all' })}
                  color="secondary"
                  variant="outlined"
                />
              )}
              {hideFullRooms && (
                <Chip
                  label="Hide full rooms"
                  size="small"
                  onDelete={() => handleFilterUpdate({ hideFullRooms: false })}
                  color="info"
                  variant="outlined"
                />
              )}
              {showActiveOnly && (
                <Chip
                  label="Active only"
                  size="small"
                  onDelete={() => handleFilterUpdate({ showActiveOnly: false })}
                  color="success"
                  variant="outlined"
                />
              )}
            </Stack>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default VoiceRoomsFilter;
