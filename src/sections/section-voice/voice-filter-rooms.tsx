// src/sections/section-voice/voice-filter-rooms.tsx

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Label } from '@/components/label';
import { useRoomTools } from '@/core/slices';
import { LEVEL_OPTIONS } from '@/lib/filter-data';
import {
  Check as CheckIcon,
  Clear as ClearIcon,
  FiberManualRecord as DotIcon,
  FilterList as FilterListIcon,
  History as HistoryIcon, // <-- Added Icon
  Language as LanguageIcon,
  PeopleAltOutlined as PeopleIcon,
  RestartAlt as ResetIcon,
  SchoolOutlined as SchoolIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  alpha,
  Autocomplete,
  Badge,
  Box,
  Button,
  Chip,
  Collapse,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
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
  showVisitedRooms: boolean;
}

export const VoiceRoomsFilter: React.FC<VoiceRoomsFilterProps> = ({
  onFilterChange,
  initialFilters = {},
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { roomLanguageOptions } = useRoomTools();

  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery || '');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    typeof initialFilters.selectedLanguage === 'string' ? initialFilters.selectedLanguage : 'all'
  );
  const [selectedLevel, setSelectedLevel] = useState(initialFilters.selectedLevel || 'all');
  const [hideFullRooms, setHideFullRooms] = useState(initialFilters.hideFullRooms || false);
  const [showActiveOnly, setShowActiveOnly] = useState(initialFilters.showActiveOnly || false);
  const [showVisitedRooms, setShowVisitedRooms] = useState(
    initialFilters.showVisitedRooms || false
  ); // <-- Added state
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({
        searchQuery,
        selectedLanguage,
        selectedLevel,
        hideFullRooms,
        showActiveOnly,
        showVisitedRooms, // <-- Included in output
      });
    }, 280);

    return () => clearTimeout(handler);
  }, [
    searchQuery,
    selectedLanguage,
    selectedLevel,
    hideFullRooms,
    showActiveOnly,
    showVisitedRooms,
    onFilterChange,
  ]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedLanguage !== 'all') count += 1;
    if (selectedLevel !== 'all') count += 1;
    if (hideFullRooms) count += 1;
    if (showActiveOnly) count += 1;
    if (showVisitedRooms) count += 1; // <-- Increment counter
    return count;
  }, [selectedLanguage, selectedLevel, hideFullRooms, showActiveOnly, showVisitedRooms]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedLanguage('all');
    setSelectedLevel('all');
    setHideFullRooms(false);
    setShowActiveOnly(false);
    setShowVisitedRooms(false); // <-- Reset on clear
  }, []);

  const handleFilterUpdate = useCallback((updates: Partial<FilterState>) => {
    if (updates.searchQuery !== undefined) setSearchQuery(updates.searchQuery);
    if (updates.selectedLanguage !== undefined) setSelectedLanguage(updates.selectedLanguage);
    if (updates.selectedLevel !== undefined) setSelectedLevel(updates.selectedLevel);
    if (updates.hideFullRooms !== undefined) setHideFullRooms(updates.hideFullRooms);
    if (updates.showActiveOnly !== undefined) setShowActiveOnly(updates.showActiveOnly);
    if (updates.showVisitedRooms !== undefined) setShowVisitedRooms(updates.showVisitedRooms); // <-- Handle update
  }, []);

  const inputSurfaceBg = 'background.default';
  const inputBorderColor = isDark ? theme.palette.grey[700] : theme.palette.grey[400];

  return (
    <Paper
      elevation={0}
      sx={{
        gridColumn: '1 / -1',
        p: { xs: 1.25, sm: 1.5 },
        mb: 1,
        bgcolor: 'background.default',
        borderRadius: 1,
        border: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
      }}
    >
      <Grid container spacing={1.25} alignItems="center">
        {/* Search Field */}
        <Grid size={{ xs: 12, md: 4.5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={isMobile ? 'Search...' : 'Search title, topic, or host...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 0.75 }}>
                  <SearchIcon
                    sx={{
                      fontSize: 18,
                      color: searchQuery ? 'primary.main' : isDark ? 'text.disabled' : '#94a3b8',
                    }}
                  />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    sx={{ p: 0.25, borderRadius: 1 }}
                  >
                    <ClearIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 26,
                borderRadius: 0.5,
                bgcolor: inputSurfaceBg,
                fontSize: '0.8rem',
                color: isDark ? 'text.primary' : '#0f172a',
                '& fieldset': { borderColor: inputBorderColor },
                '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.5) },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 1.5,
                },
              },
              '& .MuiOutlinedInput-input': { py: 0, fontSize: '0.8rem', fontWeight: 500 },
            }}
          />
        </Grid>

        {/* Language Filter (Single-Select Autocomplete) */}
        <Grid size={{ xs: 6, sm: 6, md: 2.5 }}>
          <Autocomplete
            size="small"
            options={roomLanguageOptions}
            getOptionDisabled={(option) => option.value !== 'all' && option.count === 0}
            getOptionLabel={(option) => (option.value === 'all' ? 'All Language' : option.label)}
            value={
              roomLanguageOptions.find((opt) => opt.value === selectedLanguage) ||
              roomLanguageOptions[0]
            }
            onChange={(_, newValue) => {
              handleFilterUpdate({ selectedLanguage: newValue ? newValue.value : 'all' });
            }}
            disableClearable
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                sx={{
                  fontSize: '0.8rem',
                  py: 0.6,
                  height: 26,
                  borderRadius: 0.5,
                  gap: 1,
                  // minHeight: 34,
                  fontWeight: 500,
                  opacity: option.value !== 'all' && option.count === 0 ? 0.5 : 1,
                }}
              >
                <Box sx={{ flex: 1 }}>{option.label}</Box>
                {option.count > 0 && (
                  <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 700 }}>
                    {option.count}
                  </Typography>
                )}
              </Box>
            )}
            renderInput={(params) => {
              const isAll = selectedLanguage === 'all';
              return (
                <TextField
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ pl: 1.25, mr: -0.5, borderRadius: 0.5 }}
                      >
                        {isAll ? (
                          <LanguageIcon
                            sx={{ fontSize: 16, color: isDark ? 'text.secondary' : '#64748b' }}
                          />
                        ) : (
                          <Typography component="span" sx={{ fontSize: 14 }}>
                            {
                              roomLanguageOptions.find((opt) => opt.value === selectedLanguage)
                                ?.count
                            }
                          </Typography>
                        )}
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 26,
                      borderRadius: 0.5,
                      bgcolor: inputSurfaceBg,
                      fontSize: '0.8rem',
                      color: isAll ? (isDark ? 'text.secondary' : '#475569') : 'text.primary',
                      padding: '0 8px 0 0 !important',
                      '& fieldset': { borderColor: inputBorderColor },
                      '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.5) },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 1.5,
                      },
                    },
                    '& .MuiAutocomplete-input': { fontWeight: 600, padding: '0 8px !important' },
                  }}
                />
              );
            }}
            slotProps={{
              paper: {
                sx: {
                  maxHeight: 280,
                  borderRadius: 0.5,
                  mt: 0.5,
                  bgcolor: isDark ? '#181c26' : '#ffffff',
                  border: '1px solid',
                  borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
                },
              },
            }}
          />
        </Grid>

        {/* Level Filter */}
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
                      <SchoolIcon
                        sx={{ fontSize: 16, color: isDark ? 'text.secondary' : '#64748b' }}
                      />
                      <Typography
                        variant="body2"
                        color={isDark ? 'text.secondary' : '#475569'}
                        fontSize="0.8rem"
                        fontWeight={600}
                      >
                        Level
                      </Typography>
                    </Stack>
                  );
                }
                const opt = LEVEL_OPTIONS.find((item) => item.value === selected);
                return `${opt?.emoji || ''} ${opt?.label || selected}`;
              }}
              sx={{
                height: 26,
                borderRadius: 0.5,
                bgcolor: inputSurfaceBg,
                fontSize: '0.8rem',
                color: 'text.primary',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: inputBorderColor,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 1.5,
                },
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  py: 0,
                  px: 1,
                  height: '26px !important',
                  minHeight: '26px !important',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 280,
                    borderRadius: 1,
                    mt: 0.5,
                    bgcolor: isDark ? '#181c26' : '#ffffff',
                    border: '1px solid',
                    borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
                  },
                },
              }}
            >
              {LEVEL_OPTIONS.map((opt) => (
                <MenuItem
                  key={opt.value}
                  value={opt.value}
                  sx={{
                    fontSize: '0.8rem',
                    py: 0.6,
                    gap: 1,
                    height: 26,
                    borderRadius: 0.5,
                    fontWeight: 500,
                  }}
                >
                  <Typography component="span" sx={{ fontSize: 14 }}>
                    {opt.emoji}
                  </Typography>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Action Controls */}
        <Grid
          size={{ xs: 12, md: 2.5 }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'space-between', md: 'flex-end' },
            gap: 0.75,
          }}
        >
          <Chip
            icon={<PeopleIcon sx={{ fontSize: '15px !important' }} />}
            label="Available Seats"
            clickable
            size="small"
            onClick={() => handleFilterUpdate({ hideFullRooms: !hideFullRooms })}
            sx={{
              height: 26,
              borderRadius: 0.5,
              fontWeight: 700,
              fontSize: '0.76rem',
              color: hideFullRooms ? 'primary.main' : isDark ? 'text.secondary' : '#475569',
              bgcolor: hideFullRooms
                ? alpha(theme.palette.primary.main, isDark ? 0.16 : 0.1)
                : inputSurfaceBg,
              border: '1px solid',
              borderColor: hideFullRooms
                ? alpha(theme.palette.primary.main, 0.4)
                : inputBorderColor,
              '&:hover': {
                borderColor: alpha(theme.palette.primary.main, 0.5),
                bgcolor: hideFullRooms
                  ? alpha(theme.palette.primary.main, 0.22)
                  : alpha(theme.palette.primary.main, 0.06),
              },
            }}
          />

          <Tooltip title={isExpanded ? 'Hide options' : 'More filters'} arrow>
            <Badge
              badgeContent={activeFilterCount}
              color="primary"
              overlap="rectangular"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: 9,
                  height: 16,
                  minWidth: 16,
                  fontWeight: 800,
                  borderRadius: 0.75,
                },
              }}
            >
              <IconButton
                onClick={() => setIsExpanded(!isExpanded)}
                size="small"
                sx={{
                  width: 36,
                  height: 26,
                  borderRadius: 0.5,
                  bgcolor: isExpanded
                    ? alpha(theme.palette.primary.main, isDark ? 0.16 : 0.1)
                    : inputSurfaceBg,
                  color: isExpanded ? 'primary.main' : isDark ? 'text.primary' : '#475569',
                  border: '1px solid',
                  borderColor: isExpanded
                    ? alpha(theme.palette.primary.main, 0.4)
                    : inputBorderColor,
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                    color: 'primary.main',
                  },
                }}
              >
                <FilterListIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Badge>
          </Tooltip>
        </Grid>
      </Grid>

      {/* Collapsible Panel */}
      <Collapse in={isExpanded} timeout={200} unmountOnExit>
        <Box
          sx={{
            pt: 1.25,
            mt: 1.25,
            borderTop: '1px dashed',
            borderColor: inputBorderColor,
          }}
        >
          <Grid container spacing={1} alignItems="center">
            {/* Quick Toggle Buttons (Live & Visited) */}
            <Grid size={{ xs: 12, sm: 12, md: 4 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {/* Live Only Toggle */}
                <Chip
                  icon={
                    <DotIcon
                      sx={{
                        fontSize: '10px !important',
                        color: showActiveOnly ? 'success.main' : 'text.disabled',
                      }}
                    />
                  }
                  label="Live Speaking Only"
                  clickable
                  onClick={() => handleFilterUpdate({ showActiveOnly: !showActiveOnly })}
                  sx={{
                    justifyContent: 'flex-start',
                    height: 26,
                    borderRadius: 0.5,
                    px: 0.5,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    bgcolor: showActiveOnly
                      ? isDark
                        ? alpha(theme.palette.success.main, 0.14)
                        : '#ecfdf5'
                      : inputSurfaceBg,
                    color: showActiveOnly ? 'success.main' : isDark ? 'text.secondary' : '#475569',
                    border: '1px solid',
                    borderColor: showActiveOnly
                      ? isDark
                        ? alpha(theme.palette.success.main, 0.35)
                        : '#a7f3d0'
                      : inputBorderColor,
                    '&:hover': {
                      bgcolor: theme.palette.success.main,
                      color: 'common.white',
                      borderColor: alpha(theme.palette.success.main, 0.35),
                    },
                  }}
                />

                {/* Visited Rooms Toggle */}
                <Chip
                  icon={
                    <HistoryIcon
                      sx={{
                        fontSize: '14px !important',
                        color: showVisitedRooms ? 'info.main' : 'text.disabled',
                      }}
                    />
                  }
                  label="Visited Rooms"
                  clickable
                  onClick={() => handleFilterUpdate({ showVisitedRooms: !showVisitedRooms })}
                  sx={{
                    justifyContent: 'flex-start',
                    height: 26,
                    borderRadius: 0.5,
                    px: 0.5,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    bgcolor: showVisitedRooms
                      ? isDark
                        ? alpha(theme.palette.info.main, 0.14)
                        : '#eff6ff'
                      : inputSurfaceBg,
                    color: showVisitedRooms ? 'info.main' : isDark ? 'text.secondary' : '#475569',
                    border: '1px solid',
                    borderColor: showVisitedRooms
                      ? isDark
                        ? alpha(theme.palette.info.main, 0.35)
                        : '#bfdbfe'
                      : inputBorderColor,
                    '&:hover': {
                      bgcolor: theme.palette.info.main,
                      borderColor: alpha(theme.palette.info.main, 0.35),
                      color: 'common.white',
                      '& .MuiChip-icon': { color: 'common.white' }, // Ensures icon turns white on hover
                    },
                  }}
                />
              </Stack>
            </Grid>

            {/* Popular Languages (Sorted by live count) */}
            <Grid size={{ xs: 12, sm: 6, md: 5 }}>
              <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography
                  variant="caption"
                  color={isDark ? 'text.secondary' : '#64748b'}
                  fontWeight={700}
                  fontSize="0.7rem"
                  sx={{ mr: 0.25 }}
                >
                  Quick choice:
                </Typography>
                {[...roomLanguageOptions]
                  .sort((a, b) => (b.count || 0) - (a.count || 0))
                  .slice(0, 4)
                  .map((lang) => {
                    const isSelected = selectedLanguage === lang.value;
                    return (
                      <Chip
                        key={lang.value}
                        size="small"
                        clickable
                        onClick={() =>
                          handleFilterUpdate({ selectedLanguage: isSelected ? 'all' : lang.value })
                        }
                        icon={
                          isSelected ? (
                            <CheckIcon sx={{ fontSize: '11px !important' }} />
                          ) : undefined
                        }
                        label={
                          <Box
                            component="span"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                          >
                            <Box component="span">{lang.label}</Box>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                opacity: isSelected ? 0.9 : 0.6,
                              }}
                            >
                              ({lang.count || 0})
                            </Typography>
                          </Box>
                        }
                        sx={{
                          height: 26,
                          borderRadius: 0.5,
                          fontSize: '0.7rem',
                          fontWeight: isSelected ? 700 : 600,
                          bgcolor: isSelected ? theme.palette.primary.main : inputSurfaceBg,
                          color: isSelected
                            ? 'primary.contrastText'
                            : isDark
                              ? 'text.primary'
                              : '#334155',
                          border: '1px solid',
                          borderColor: isSelected ? theme.palette.primary.main : inputBorderColor,
                          '&:hover': {
                            bgcolor: theme.palette.primary.main,
                            color: 'common.white',
                          },
                        }}
                      />
                    );
                  })}
              </Stack>
            </Grid>

            {/* Reset */}
            <Grid
              size={{ xs: 12, md: 3 }}
              sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
            >
              <Button
                size="small"
                variant="text"
                color="error"
                disabled={activeFilterCount === 0 && !searchQuery}
                onClick={handleClearFilters}
                startIcon={<ResetIcon sx={{ fontSize: '14px !important' }} />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  py: 0.25,
                  px: 1,
                  height: 28,
                  borderRadius: 1,
                }}
              >
                Reset Filters
              </Button>
            </Grid>
          </Grid>

          {/* Active Filter Badges */}
          {activeFilterCount > 0 && (
            <Stack
              direction="row"
              spacing={0.5}
              flexWrap="wrap"
              useFlexGap
              alignItems="center"
              sx={{
                mt: 1,
                pt: 1,
                borderTop: '1px solid',
                borderColor: isDark ? alpha('#fff', 0.06) : '#f1f5f9',
              }}
            >
              <Typography
                variant="caption"
                color={isDark ? 'text.secondary' : '#64748b'}
                fontWeight={700}
                fontSize="0.7rem"
              >
                Applied:
              </Typography>
              {selectedLanguage !== 'all' && (
                <Label
                  label={`Lang: ${selectedLanguage.toUpperCase()}`}
                  size="small"
                  color="primary"
                  variant="soft"
                  onDelete={() => handleFilterUpdate({ selectedLanguage: 'all' })}
                  sx={{ height: 24, borderRadius: 0.5, fontSize: '0.68rem' }}
                />
              )}
              {selectedLevel !== 'all' && (
                <Label
                  label={`Level: ${selectedLevel}`}
                  size="small"
                  color="secondary"
                  variant="soft"
                  onDelete={() => handleFilterUpdate({ selectedLevel: 'all' })}
                  sx={{ height: 24, borderRadius: 0.5, fontSize: '0.68rem' }}
                />
              )}
              {hideFullRooms && (
                <Label
                  label="Seats Available"
                  size="small"
                  color="info"
                  variant="soft"
                  onDelete={() => handleFilterUpdate({ hideFullRooms: false })}
                  sx={{ height: 24, borderRadius: 0.5, fontSize: '0.68rem' }}
                />
              )}
              {showActiveOnly && (
                <Label
                  label="Live"
                  size="small"
                  color="success"
                  variant="soft"
                  onDelete={() => handleFilterUpdate({ showActiveOnly: false })}
                  sx={{ height: 24, borderRadius: 0.5, fontSize: '0.68rem' }}
                />
              )}
              {showVisitedRooms && (
                <Label
                  label="Visited"
                  size="small"
                  color="info" // Distinguishable badge color
                  variant="soft"
                  onDelete={() => handleFilterUpdate({ showVisitedRooms: false })}
                  sx={{ height: 24, borderRadius: 0.5, fontSize: '0.68rem' }}
                />
              )}
            </Stack>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default VoiceRoomsFilter;
