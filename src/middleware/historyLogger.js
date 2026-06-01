const HistoryRecord = require('../models/HistoryRecord');

// 中间件生成器，用于为指定模型创建历史记录中间件
const createHistoryLogger = (modelName) => {
  return {
    // 记录创建操作
    preSave: function(next) {
      const doc = this;
      if (!doc.isNew) return next();
      
      // 保存原始数据以便在post保存后记录
      doc._originalData = doc.toObject();
      next();
    },
    
    // 记录更新操作
    preUpdate: function(next) {
      const doc = this;
      doc._originalData = doc.toObject();
      next();
    },
    
    // 记录创建和更新操作
    postSave: async function(doc, next) {
      try {
        const originalData = doc._originalData;
        const newData = doc.toObject();
        
        // 确定操作类型
        const operation = originalData._id ? 'update' : 'create';
        
        // 计算变更的字段
        const changedFields = [];
        if (operation === 'update') {
          for (const field in newData) {
            if (JSON.stringify(originalData[field]) !== JSON.stringify(newData[field])) {
              changedFields.push(field);
            }
          }
        }
        
        // 构建历史记录
        const historyRecord = new HistoryRecord({
          model: modelName,
          documentId: doc._id,
          operation: operation,
          previousData: operation === 'update' ? originalData : null,
          newData: newData,
          changedFields: changedFields,
          // 从请求上下文中获取用户信息和IP地址
          userId: doc._userContext?.userId,
          ipAddress: doc._userContext?.ipAddress,
          userAgent: doc._userContext?.userAgent
        });
        
        await historyRecord.save();
        next();
      } catch (error) {
        console.error('Error creating history record:', error);
        next(); // 即使历史记录失败，也继续保存文档
      }
    },
    
    // 记录删除操作
    preRemove: async function(next) {
      try {
        const doc = this;
        
        // 构建历史记录
        const historyRecord = new HistoryRecord({
          model: modelName,
          documentId: doc._id,
          operation: 'delete',
          previousData: doc.toObject(),
          newData: null,
          changedFields: [],
          // 从请求上下文中获取用户信息和IP地址
          userId: doc._userContext?.userId,
          ipAddress: doc._userContext?.ipAddress,
          userAgent: doc._userContext?.userAgent
        });
        
        await historyRecord.save();
        next();
      } catch (error) {
        console.error('Error creating history record for delete:', error);
        next(); // 即使历史记录失败，也继续删除文档
      }
    },
    
    // 为请求添加用户上下文
    addUserContext: (req, res, next) => {
      // 将用户上下文添加到请求对象中
      req.userContext = {
        userId: req.user?.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };
      next();
    },
    
    // 应用用户上下文到文档
    applyUserContext: (req, res, next) => {
      // 重写Model的findById方法，添加用户上下文
      const originalFindById = req.model.findById;
      req.model.findById = async function(id, ...args) {
        const doc = await originalFindById.call(this, id, ...args);
        if (doc) {
          doc._userContext = req.userContext;
        }
        return doc;
      };
      
      // 重写Model的findOne方法，添加用户上下文
      const originalFindOne = req.model.findOne;
      req.model.findOne = async function(query, ...args) {
        const doc = await originalFindOne.call(this, query, ...args);
        if (doc) {
          doc._userContext = req.userContext;
        }
        return doc;
      };
      
      // 重写Model的findByIdAndUpdate方法，添加历史记录
      const originalFindByIdAndUpdate = req.model.findByIdAndUpdate;
      req.model.findByIdAndUpdate = async function(id, update, options = {}) {
        // 获取原始文档
        const originalDoc = await originalFindOne.call(this, { _id: id });
        if (!originalDoc) return null;
        
        // 应用用户上下文
        originalDoc._userContext = req.userContext;
        
        // 执行更新
        const updatedDoc = await originalFindByIdAndUpdate.call(this, id, update, { ...options, new: true });
        if (!updatedDoc) return null;
        
        // 计算变更的字段
        const originalData = originalDoc.toObject();
        const newData = updatedDoc.toObject();
        const changedFields = [];
        
        for (const field in newData) {
          if (JSON.stringify(originalData[field]) !== JSON.stringify(newData[field])) {
            changedFields.push(field);
          }
        }
        
        // 构建历史记录
        const historyRecord = new HistoryRecord({
          model: modelName,
          documentId: updatedDoc._id,
          operation: 'update',
          previousData: originalData,
          newData: newData,
          changedFields: changedFields,
          userId: req.userContext?.userId,
          ipAddress: req.userContext?.ipAddress,
          userAgent: req.userContext?.userAgent
        });
        
        await historyRecord.save();
        return updatedDoc;
      };
      
      // 重写Model的findByIdAndDelete方法，添加历史记录
      const originalFindByIdAndDelete = req.model.findByIdAndDelete;
      req.model.findByIdAndDelete = async function(id, options = {}) {
        // 获取原始文档
        const originalDoc = await originalFindOne.call(this, { _id: id });
        if (!originalDoc) return null;
        
        // 应用用户上下文
        originalDoc._userContext = req.userContext;
        
        // 构建历史记录
        const historyRecord = new HistoryRecord({
          model: modelName,
          documentId: originalDoc._id,
          operation: 'delete',
          previousData: originalDoc.toObject(),
          newData: null,
          changedFields: [],
          userId: req.userContext?.userId,
          ipAddress: req.userContext?.ipAddress,
          userAgent: req.userContext?.userAgent
        });
        
        await historyRecord.save();
        
        // 执行删除
        return await originalFindByIdAndDelete.call(this, id, options);
      };
      
      next();
    },
    
    // 获取模型的历史记录
    getHistory: async (documentId) => {
      try {
        const historyRecords = await HistoryRecord.find({
          model: modelName,
          documentId: documentId
        }).sort({ timestamp: -1 });
        return historyRecords;
      } catch (error) {
        console.error('Error getting history records:', error);
        return [];
      }
    }
  };
};

module.exports = createHistoryLogger;
