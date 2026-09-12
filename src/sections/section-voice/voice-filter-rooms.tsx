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
  useMediaQuery,
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  // Shared compact sizing for the two select fields
  const selectSx = {
    borderRadius: 1,
    bgcolor: alpha(theme.palette.background.default, 0.5),
    '&:hover': {
      bgcolor: alpha(theme.palette.background.default, 0.8),
    },
    '& .MuiSelect-select': {
      px: { xs: 1, sm: 1.2 },
      py: { xs: 0.65, sm: 0.85 },
      fontSize: { xs: '0.78rem', sm: '0.875rem' },
    },
  } as const;

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
      <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
        {/* Search Field */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={isMobile ? 'Search rooms...' : 'Search title, topic, or host...'}
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => handleFilterUpdate({ searchQuery: '' })}
                    sx={{ px: 0.5 }}
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
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                '&:hover': {
                  bgcolor: alpha(theme.palette.background.default, 0.8),
                },
              },
              '& .MuiOutlinedInput-input': {
                py: { xs: 0.6, sm: 1 },
              },
            }}
          />
        </Grid>

        {/* Quick Filters - Desktop */}
        <Grid size={{ xs: 6, sm: 6, md: 2.5 }}>
          <FormControl fullWidth size="small">
            <Select
              value={selectedLanguage}
              onChange={(e) => handleFilterUpdate({ selectedLanguage: e.target.value })}
              displayEmpty
              renderValue={(selected) => {
                if (!selected || selected === 'all') {
                  return (
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <LanguageIcon fontSize="small" color="action" />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.78rem', sm: '0.875rem' } }}
                      >
                        {isMobile ? 'Language' : 'Language'}
                      </Typography>
                    </Stack>
                  );
                }
                const option = LANGUAGE_OPTIONS.find((opt) => opt.value === selected);
                if (!option) return selected;
                return `${option.emoji} ${option.label}`;
              }}
              sx={selectSx}
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.emoji} {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 2.5 }}>
          <FormControl fullWidth size="small">
            <Select
              value={selectedLevel}
              onChange={(e) => handleFilterUpdate({ selectedLevel: e.target.value })}
              displayEmpty
              renderValue={(selected) => {
                if (!selected || selected === 'all') {
                  return (
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <SchoolIcon fontSize="small" color="action" />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.78rem', sm: '0.875rem' } }}
                      >
                        Level
                      </Typography>
                    </Stack>
                  );
                }
                const option = LEVEL_OPTIONS.find((opt) => opt.value === selected);
                if (!option) return selected;
                return `${option.emoji} ${option.label}`;
              }}
              sx={selectSx}
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
            justifyContent: { xs: 'space-between', sm: 'flex-start', md: 'flex-end' },
            gap: 1,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }}>
            <FormControlLabel
              sx={{
                ml: 0,
                mr: { xs: 0.25, sm: 1 },
                '& .MuiFormControlLabel-label': {
                  ml: 0.25,
                },
              }}
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
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: { xs: 'none', sm: 'inline' } }}
                  >
                    Hide full
                  </Typography>
                </Stack>
              }
            />

            <IconButton
              onClick={() => setIsExpanded(!isExpanded)}
              size="small"
              sx={{
                position: 'relative',
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
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
            pt: { xs: 1.25, sm: 2 },
            mt: { xs: 1, sm: 1.5 },
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            animation: 'fadeIn 0.3s ease',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(-10px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
            {/* Active Only Toggle */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showActiveOnly}
                    onChange={(e) => handleFilterUpdate({ showActiveOnly: e.target.checked })}
                    size="small"
                    color="success"
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                  >
                    🔴 Active rooms only
                  </Typography>
                }
              />
            </Grid>

            {/* Quick Chips */}
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap alignItems="center">
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mr: 0.5, alignSelf: 'center', display: { xs: 'none', sm: 'inline' } }}
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
                      fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                      height: { xs: 24, sm: 28 },
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
                startIcon={<ClearIcon fontSize="small" />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: { xs: '0.78rem', sm: '0.8125rem' },
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
              spacing={0.75}
              flexWrap="wrap"
              useFlexGap
              alignItems="center"
              sx={{
                mt: { xs: 1.25, sm: 2 },
                pt: { xs: 1.25, sm: 2 },
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mr: 0.5, alignSelf: 'center' }}
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
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.8125rem' }, height: { xs: 24, sm: 28 } }}
                />
              )}
              {selectedLevel !== 'all' && (
                <Chip
                  label={`Level: ${selectedLevel}`}
                  size="small"
                  onDelete={() => handleFilterUpdate({ selectedLevel: 'all' })}
                  color="secondary"
                  variant="outlined"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.8125rem' }, height: { xs: 24, sm: 28 } }}
                />
              )}
              {hideFullRooms && (
                <Chip
                  label="Hide full rooms"
                  size="small"
                  onDelete={() => handleFilterUpdate({ hideFullRooms: false })}
                  color="info"
                  variant="outlined"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.8125rem' }, height: { xs: 24, sm: 28 } }}
                />
              )}
              {showActiveOnly && (
                <Chip
                  label="Active only"
                  size="small"
                  onDelete={() => handleFilterUpdate({ showActiveOnly: false })}
                  color="success"
                  variant="outlined"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.8125rem' }, height: { xs: 24, sm: 28 } }}
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
