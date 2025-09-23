import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getDeviceId } from '../config/supabase';

const SupabaseContext = createContext();

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

export const SupabaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // 현재 세션 가져오기
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // 로그인 함수
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // 회원가입 함수
  const signUp = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // 로그아웃 함수
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // 비밀번호 재설정
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // 사용자 프로필 업데이트
  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // 데이터베이스 작업 헬퍼 함수들
  const insertData = async (table, data) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();
      
      if (error) throw error;
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateData = async (table, data, match) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .match(match)
        .select();
      
      if (error) throw error;
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const deleteData = async (table, match) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .match(match);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const fetchData = async (table, query = {}) => {
    try {
      let queryBuilder = supabase.from(table).select();
      
      // 필터 적용
      if (query.filter) {
        Object.entries(query.filter).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }
      
      // 정렬 적용
      if (query.orderBy) {
        queryBuilder = queryBuilder.order(query.orderBy.column, {
          ascending: query.orderBy.ascending !== false
        });
      }
      
      // 페이지네이션 적용
      if (query.range) {
        queryBuilder = queryBuilder.range(query.range.from, query.range.to);
      }
      
      const { data, error } = await queryBuilder;
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // 닉네임 관련 함수들
  const checkNicknameDuplicate = async (nickname) => {
    try {
      const { data, error } = await supabase.rpc('check_nickname_duplicate', {
        nickname_param: nickname
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const createUserWithNickname = async (nickname) => {
    try {
      const deviceId = getDeviceId();
      const { data, error } = await supabase.rpc('create_user_with_nickname', {
        nickname_param: nickname,
        device_id_param: deviceId
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    session,
    loading,
    supabase,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    insertData,
    updateData,
    deleteData,
    fetchData,
    checkNicknameDuplicate,
    createUserWithNickname
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}; 