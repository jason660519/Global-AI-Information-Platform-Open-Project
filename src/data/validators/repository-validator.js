import Joi from 'joi';
import logger from '../../utils/logger.js';

/**
 * 倉庫數據驗證器
 * 用於驗證GitHub倉庫數據的完整性和有效性
 */

// 定義倉庫數據的Joi驗證模式
const repositorySchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  full_name: Joi.string().required().min(1).max(200),
  description: Joi.string().allow(null, '').max(1000),
  url: Joi.string().uri().required(),
  homepage: Joi.string().uri().allow(null, ''),
  stars: Joi.number().integer().min(0).required(),
  forks: Joi.number().integer().min(0).required(),
  language: Joi.string().allow(null, '').max(50),
  topics: Joi.array().items(Joi.string().max(50)).default([]),
  owner: Joi.object({
    login: Joi.string().required().min(1).max(100),
    type: Joi.string().valid('User', 'Organization').required(),
    url: Joi.string().uri().required(),
  }).required(),
  created_at: Joi.string().isoDate().required(),
  updated_at: Joi.string().isoDate().required(),
  license: Joi.object({
    key: Joi.string().allow(null),
    name: Joi.string().allow(null),
    spdx_id: Joi.string().allow(null),
    url: Joi.string().uri().allow(null),
  }).allow(null),
  metadata: Joi.object({
    api_url: Joi.string().uri(),
    open_issues: Joi.number().integer().min(0),
    watchers: Joi.number().integer().min(0),
    default_branch: Joi.string().default('main'),
    is_fork: Joi.boolean().default(false),
  }).default({}),
});

/**
 * 驗證倉庫數據
 * @param {Object} data - 要驗證的倉庫數據
 * @returns {Object} 驗證結果 { isValid: boolean, data?: Object, errors?: Array }
 */
export function validateRepositoryData(data) {
  try {
    const { error, value } = repositorySchema.validate(data, {
      abortEarly: false, // 收集所有錯誤
      stripUnknown: true, // 移除未知字段
      convert: true, // 自動類型轉換
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      logger.warn('倉庫數據驗證失敗', {
        errors,
        data: JSON.stringify(data, null, 2),
      });

      return {
        isValid: false,
        errors,
      };
    }

    logger.debug('倉庫數據驗證成功', {
      name: value.full_name,
      stars: value.stars,
    });

    return {
      isValid: true,
      data: value,
    };
  } catch (err) {
    logger.error('驗證過程中發生錯誤', {
      error: err.message,
      stack: err.stack,
      data: JSON.stringify(data, null, 2),
    });

    return {
      isValid: false,
      errors: [
        {
          field: 'validation',
          message: `驗證過程中發生錯誤: ${err.message}`,
          value: null,
        },
      ],
    };
  }
}

/**
 * 批量驗證倉庫數據
 * @param {Array} repositories - 倉庫數據數組
 * @returns {Object} 批量驗證結果 { valid: Array, invalid: Array, summary: Object }
 */
export function validateRepositoriesBatch(repositories) {
  const results = {
    valid: [],
    invalid: [],
    summary: {
      total: repositories.length,
      validCount: 0,
      invalidCount: 0,
      validationRate: 0,
    },
  };

  repositories.forEach((repo, index) => {
    const validation = validateRepositoryData(repo);

    if (validation.isValid) {
      results.valid.push({
        index,
        data: validation.data,
      });
      results.summary.validCount++;
    } else {
      results.invalid.push({
        index,
        data: repo,
        errors: validation.errors,
      });
      results.summary.invalidCount++;
    }
  });

  results.summary.validationRate =
    results.summary.total > 0
      ? ((results.summary.validCount / results.summary.total) * 100).toFixed(2)
      : 0;

  logger.info('批量驗證完成', {
    total: results.summary.total,
    valid: results.summary.validCount,
    invalid: results.summary.invalidCount,
    rate: `${results.summary.validationRate}%`,
  });

  return results;
}

/**
 * 驗證必要字段是否存在
 * @param {Object} data - 要檢查的數據
 * @returns {Object} 檢查結果
 */
export function validateRequiredFields(data) {
  const requiredFields = [
    'name',
    'full_name',
    'url',
    'stars',
    'forks',
    'owner',
    'created_at',
    'updated_at',
  ];
  const missingFields = [];
  const invalidFields = [];

  requiredFields.forEach(field => {
    if (!(field in data) || data[field] === null || data[field] === undefined) {
      missingFields.push(field);
    } else if (field === 'owner' && (!data[field].login || !data[field].type)) {
      invalidFields.push(`${field}.login or ${field}.type`);
    }
  });

  const isValid = missingFields.length === 0 && invalidFields.length === 0;

  return {
    isValid,
    missingFields,
    invalidFields,
    message: isValid
      ? '所有必要字段都存在且有效'
      : `缺少字段: ${missingFields.join(', ')}${invalidFields.length > 0 ? '; 無效字段: ' + invalidFields.join(', ') : ''}`,
  };
}

export default {
  validateRepositoryData,
  validateRepositoriesBatch,
  validateRequiredFields,
  repositorySchema,
};
