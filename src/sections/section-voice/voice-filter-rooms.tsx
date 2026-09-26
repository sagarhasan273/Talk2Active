import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Label } from '@/components/label';
import { languages, LEVEL_OPTIONS } from '@/lib/filter-data';
import {
  Check as CheckIcon,
  Clear as ClearIcon,
  FiberManualRecord as DotIcon,
  FilterList as FilterListIcon,
  Language as LanguageIcon,
  PeopleAltOutlined as PeopleIcon,
  RestartAlt as ResetIcon,
  SchoolOutlined as SchoolIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  alpha,
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
}

const LANGUAGE_OPTIONS = [
  { value: 'all', label: 'All Languages', emoji: '🌐' },
  ...languages.map(({ code, name, flag }) => ({
    value: code,
    label: name,
    emoji: flag,
  })),
];

export const VoiceRoomsFilter: React.FC<VoiceRoomsFilterProps> = ({
  onFilterChange,
  initialFilters = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery || '');
  const [selectedLanguage, setSelectedLanguage] = useState(initialFilters.selectedLanguage || 'all');
  const [selectedLevel, setSelectedLevel] = useState(initialFilters.selectedLevel || 'all');
  const [hideFullRooms, setHideFullRooms] = useState(initialFilters.hideFullRooms || false);
  const [showActiveOnly, setShowActiveOnly] = useState(initialFilters.showActiveOnly || false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({
        searchQuery,
        selectedLanguage,
        selectedLevel,
        hideFullRooms,
        showActiveOnly,
      });
    }, 280);

    return () => clearTimeout(handler);
  }, [searchQuery, selectedLanguage, selectedLevel, hideFullRooms, showActiveOnly, onFilterChange]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedLanguage !== 'all') count += 1;
    if (selectedLevel !== 'all') count += 1;
    if (hideFullRooms) count += 1;
    if (showActiveOnly) count += 1;
    return count;
  }, [selectedLanguage, selectedLevel, hideFullRooms, showActiveOnly]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedLanguage('all');
    setSelectedLevel('all');
    setHideFullRooms(false);
    setShowActiveOnly(false);
    setIsExpanded(false);
  }, []);

  const handleFilterUpdate = useCallback((updates: Partial<FilterState>) => {
    if (updates.searchQuery !== undefined) setSearchQuery(updates.searchQuery);
    if (updates.selectedLanguage !== undefined) setSelectedLanguage(updates.selectedLanguage);
    if (updates.selectedLevel !== undefined) setSelectedLevel(updates.selectedLevel);
    if (updates.hideFullRooms !== undefined) setHideFullRooms(updates.hideFullRooms);
    if (updates.showActiveOnly !== undefined) setShowActiveOnly(updates.showActiveOnly);
  }, []);

  // Micro 32px height styling for selects
  const compactSelectSx = {
    height: 32,
    borderRadius: 1,
    bgcolor: alpha(theme.palette.background.default, 0.6),
    fontSize: '0.78rem',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: alpha(theme.palette.divider, 0.14),
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: alpha(theme.palette.primary.main, 0.4),
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      borderWidth: 1.5,
    },
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
      py: 0,
      px: 1.25,
      height: '32px !important',
      fontSize: '0.78rem',
      fontWeight: 500,
    },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        gridColumn: '1 / -1',
        p: { xs: 1, sm: 1.25 },
        bgcolor: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(16px)',
        borderRadius: 1,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 2px 10px -2px ${alpha(theme.palette.common.black, 0.04)}`,
      }}
    >
      <Grid container spacing={1} alignItems="center">
        {/* Search Field - Compact 32px */}
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
                      fontSize: 17,
                      color: searchQuery ? 'primary.main' : 'text.disabled',
                    }}
                  />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    sx={{ p: 0.25 }}
                  >
                    <ClearIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 32,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.background.default, 0.6),
                fontSize: '0.78rem',
                '& fieldset': {
                  borderColor: alpha(theme.palette.divider, 0.14),
                },
                '&:hover fieldset': {
                  borderColor: alpha(theme.palette.primary.main, 0.4),
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 1.5,
                },
              },
              '& .MuiOutlinedInput-input': {
                py: 0,
                fontSize: '0.78rem',
              },
            }}
          />
        </Grid>

        {/* Language Filter */}
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
                      <LanguageIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" fontSize="0.78rem" fontWeight={500}>
                        Language
                      </Typography>
                    </Stack>
                  );
                }
                const opt = LANGUAGE_OPTIONS.find((item) => item.value === selected);
                return `${opt?.emoji || ''} ${opt?.label || selected}`;
              }}
              sx={compactSelectSx}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 280, borderRadius: 1.5 },
                },
              }}
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <MenuItem
                  key={opt.value}
                  value={opt.value}
                  sx={{ fontSize: '0.78rem', py: 0.5, gap: 1, minHeight: 32 }}
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
                      <SchoolIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" fontSize="0.78rem" fontWeight={500}>
                        Level
                      </Typography>
                    </Stack>
                  );
                }
                const opt = LEVEL_OPTIONS.find((item) => item.value === selected);
                return `${opt?.emoji || ''} ${opt?.label || selected}`;
              }}
              sx={compactSelectSx}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 280, borderRadius: 1.5 },
                },
              }}
            >
              {LEVEL_OPTIONS.map((opt) => (
                <MenuItem
                  key={opt.value}
                  value={opt.value}
                  sx={{ fontSize: '0.78rem', py: 0.5, gap: 1, minHeight: 32 }}
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
          {/* Quick Pill: Available Seats */}
          <Chip
            icon={<PeopleIcon sx={{ fontSize: '14px !important' }} />}
            label="Available Seats"
            clickable
            size="small"
            onClick={() => handleFilterUpdate({ hideFullRooms: !hideFullRooms })}
            sx={{
              height: 32,
              borderRadius: 1,
              px: 0.25,
              fontWeight: 600,
              fontSize: '0.75rem',
              color: hideFullRooms ? 'info.dark' : 'text.secondary',
              bgcolor: hideFullRooms
                ? alpha(theme.palette.info.main, 0.12)
                : alpha(theme.palette.text.primary, 0.04),
              border: `1px solid ${hideFullRooms ? alpha(theme.palette.info.main, 0.3) : 'transparent'
                }`,
            }}
          />

          {/* Filter Toggle Button */}
          <Tooltip title={isExpanded ? 'Hide options' : 'More filters'}>
            <Badge
              badgeContent={activeFilterCount}
              color="primary"
              overlap="circular"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: 9,
                  height: 16,
                  minWidth: 16,
                  fontWeight: 800,
                },
              }}
            >
              <IconButton
                onClick={() => setIsExpanded(!isExpanded)}
                size="small"
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: isExpanded
                    ? alpha(theme.palette.primary.main, 0.1)
                    : alpha(theme.palette.text.primary, 0.04),
                  color: isExpanded ? 'primary.main' : 'text.primary',
                  border: `1px solid ${isExpanded ? alpha(theme.palette.primary.main, 0.25) : alpha(theme.palette.divider, 0.12)
                    }`,
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
            mt: 1,
            borderTop: `1px dashed ${alpha(theme.palette.divider, 0.15)}`,
          }}
        >
          <Grid container spacing={1} alignItems="center">
            {/* Live Only Toggle */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                  width: '100%',
                  justifyContent: 'flex-start',
                  height: 28,
                  borderRadius: 1,
                  px: 0.5,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  bgcolor: showActiveOnly
                    ? alpha(theme.palette.success.main, 0.12)
                    : alpha(theme.palette.background.default, 0.5),
                  color: showActiveOnly ? 'success.dark' : 'text.secondary',
                  border: `1px solid ${showActiveOnly ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.divider, 0.1)
                    }`,
                }}
              />
            </Grid>

            {/* Popular Languages */}
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize="0.7rem" sx={{ mr: 0.25 }}>
                  Popular:
                </Typography>
                {LANGUAGE_OPTIONS.slice(1, 5).map((lang) => {
                  const isSelected = selectedLanguage === lang.value;
                  return (
                    <Chip
                      key={lang.value}
                      label={`${lang.emoji} ${lang.label}`}
                      size="small"
                      clickable
                      onClick={() =>
                        handleFilterUpdate({
                          selectedLanguage: isSelected ? 'all' : lang.value,
                        })
                      }
                      icon={
                        isSelected ? (
                          <CheckIcon sx={{ fontSize: '11px !important' }} />
                        ) : undefined
                      }
                      sx={{
                        borderRadius: 1,
                        fontSize: '0.7rem',
                        fontWeight: isSelected ? 700 : 500,
                        height: 24,
                        bgcolor: isSelected
                          ? theme.palette.primary.main
                          : alpha(theme.palette.text.primary, 0.04),
                        color: isSelected ? 'primary.contrastText' : 'text.primary',
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
                  fontSize: '0.72rem',
                  py: 0.25,
                  px: 1,
                  height: 26,
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
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize="0.7rem">
                Applied:
              </Typography>
              {selectedLanguage !== 'all' && (
                <Label
                  label={`Lang: ${selectedLanguage.toUpperCase()}`}
                  size="small"
                  color="primary"
                  variant="soft"
                  onDelete={() => handleFilterUpdate({ selectedLanguage: 'all' })}
                  sx={{ height: 20, fontSize: '0.68rem' }}
                />
              )}
              {selectedLevel !== 'all' && (
                <Label
                  label={`Level: ${selectedLevel}`}
                  size="small"
                  color="secondary"
                  variant="soft"
                  onDelete={() => handleFilterUpdate({ selectedLevel: 'all' })}
                  sx={{ height: 20, fontSize: '0.68rem' }}
                />
              )}
              {hideFullRooms && (
                <Label
                  label="Seats Available"
                  size="small"
                  color="info"
                  variant="soft"
                  onDelete={() => handleFilterUpdate({ hideFullRooms: false })}
                  sx={{ height: 20, fontSize: '0.68rem' }}
                />
              )}
              {showActiveOnly && (
                <Label
                  label="Live"
                  size="small"
                  color="success"
                  variant="soft"
                  onDelete={() => handleFilterUpdate({ showActiveOnly: false })}
                  sx={{ height: 20, fontSize: '0.68rem' }}
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
